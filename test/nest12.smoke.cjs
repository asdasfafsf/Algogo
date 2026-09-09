const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const { randomUUID } = require('node:crypto');

// This suite writes a user and a queue job. Only an isolated local test database is allowed.
const realServices = process.env.NEST12_REAL_SERVICES === 'true';
if (!realServices) process.env.BULLMQ_QUEUE_NAME = 'nest12-smoke-test';

const database = new URL(process.env.DATABASE_URL);
assert.equal(process.env.NODE_ENV, 'test');
assert.match(database.hostname, /^(localhost|127\.0\.0\.1)$/);
assert.match(database.pathname, /_test$/);
assert.match(process.env.REDIS_HOST, /^(localhost|127\.0\.0\.1)$/);
assert.match(process.env.BULLMQ_HOST, /^(localhost|127\.0\.0\.1)$/);
assert.match(
  process.env.BULLMQ_QUEUE_NAME,
  realServices ? /^execute$/ : /test/,
);

const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { CACHE_MANAGER } = require('@nestjs/cache-manager');
const { Worker } = require('bullmq');
const { io } = require('socket.io-client');
const cookieParser = require('cookie-parser');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { JwtService } = require('../dist/jwt/jwt.service');
const { ExecuteService } = require('../dist/execute/execute.service');
const { RedisIoAdapter } = require('../dist/redis/redis.io.adapter');

let app, prisma, worker, socket, baseUrl, token;
const userUuid = randomUUID();
const cacheKey = `nest12-smoke:${userUuid}`;

async function within(promise, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Timed out: ${label}`)),
          5000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

before(
  async () => {
    app = await NestFactory.create(AppModule, {
      logger: false,
      abortOnError: false,
    });
    app.get('winston').silent = true;
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    const adapter = new RedisIoAdapter(app);
    await adapter.connectToRedis();
    app.useWebSocketAdapter(adapter);
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
    prisma = app.get(PrismaService);
    await prisma.user.create({
      data: {
        uuid: userUuid,
        email: `${userUuid}@example.test`,
        name: 'Nest12 smoke',
        profilePhoto: '',
        emailVerified: false,
        state: 'ACTIVE',
        lastLoginDate: new Date(),
      },
    });
    token = await app.get(JwtService).sign({ sub: userUuid, roles: [] }, 300);
  },
  { timeout: 20000 },
);

after(
  async () => {
    socket?.disconnect();
    await worker?.close();
    if (prisma) await prisma.user.deleteMany({ where: { uuid: userUuid } });
    if (app) {
      await app.get(CACHE_MANAGER).del(cacheKey);
      await app.close();
    }
  },
  { timeout: 10000 },
);

test('Joi 18 configuration and Redis cache work through Nest 12', async () => {
  const config = app.get(ConfigService);
  assert.equal(config.get('NODE_ENV'), 'test');
  assert.equal(typeof config.get('REDIS_PORT'), 'number');
  const cache = app.get(CACHE_MANAGER);
  await cache.set(cacheKey, { migrated: true }, 10000);
  assert.deepEqual(await cache.get(cacheKey), { migrated: true });
});

test('HTTP guard, cookie authentication, database and response interceptors work', async () => {
  const denied = await fetch(`${baseUrl}/api/v1/me`);
  assert.equal(denied.status, 401);
  const authenticated = await fetch(`${baseUrl}/api/v1/me`, {
    headers: { Cookie: `access_token=${token}` },
  });
  assert.equal(authenticated.status, 200);
  const body = await authenticated.json();
  assert.equal(body.errorCode, '0000');
  assert.equal(body.data.uuid, userUuid);
});

test('DTO validation still rejects invalid input through the HTTP pipeline', async () => {
  const response = await fetch(`${baseUrl}/api/v1/code/setting`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fontSize: -100 }),
  });
  assert.equal(response.status, 400);
});

test('Swagger can discover existing controllers and DTO metadata', () => {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Migration smoke').setVersion('12').build(),
  );
  assert.ok(document.paths['/api/v1/me']);
  assert.ok(document.paths['/api/v1/code/setting']);
  assert.ok(Object.keys(document.components.schemas).length > 0);
});

test(
  'Socket authentication and BullMQ progress reach the connected client',
  { timeout: 15000 },
  async () => {
    socket = io(baseUrl, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
    });
    const authResult = new Promise((resolve, reject) => {
      socket.once('connect_error', reject);
      socket.once('connect', () => socket.emit('auth', { token }));
      socket.once('auth', resolve);
    });
    socket.connect();
    assert.equal(
      (await within(authResult, 'socket authentication')).code,
      '0000',
    );
    if (!realServices) {
      worker = new Worker(
        process.env.BULLMQ_QUEUE_NAME,
        async (job) => {
          // Compiler is intentionally replaced; this verifies the application's real queue/event transport.
          await job.updateProgress({
            stage: 'execute',
            id: job.data.id,
            result: 'migration-ok',
          });
          return { code: '0000', result: 'migration-ok' };
        },
        {
          connection: {
            host: process.env.BULLMQ_HOST,
            port: Number(process.env.BULLMQ_PORT),
            password: process.env.BULLMQ_PASSWORD,
          },
        },
      );
      await worker.waitUntilReady();
    }
    const progress = new Promise((resolve) =>
      socket.once('executeResult', resolve),
    );
    // Exercise the queue service directly: the pre-existing execute DTO issue is handled separately.
    const result = await app.get(ExecuteService).run({
      id: socket.id,
      provider: 'Python',
      code: 'print("migration-ok")',
      inputList: [{ input: '' }],
    });
    assert.equal(result.code, '0000');
    assert.equal(
      (await within(progress, 'queue progress delivery')).result,
      'migration-ok',
    );
  },
);

if (realServices) {
  const javaCode =
    'public class Main { public static void main(String[] args) { System.out.print(42); } }';
  const programs = {
    Python: 'print(42)',
    'Node.js': 'console.log(42)',
    'C++': '#include <iostream>\nint main(){std::cout << 42;}',
    Clang: '#include <stdio.h>\nint main(){printf("42");}',
    Java: javaCode,
    Java17: javaCode,
  };
  for (const [index, [provider, code]] of Object.entries(programs).entries()) {
    test(`real compiler executes ${provider}`, { timeout: 15000 }, async () => {
      // API 인스턴스가 같은 큐 결과를 중복 전달해도 이번 입력의 결과만 받는다.
      const seq = index + 1;
      let onProgress;
      const progress = new Promise((resolve) => {
        onProgress = (data) => {
          if (data.seq === seq) resolve(data);
        };
        socket.on('executeResult', onProgress);
      });
      try {
        const result = await app.get(ExecuteService).run({
          id: socket.id,
          provider,
          code,
          inputList: [{ seq, input: '' }],
        });
        assert.equal(result.code, '0000', JSON.stringify(result));
        const output = await within(progress, `${provider} result`);
        assert.equal(output.code, '0000', JSON.stringify(output));
        assert.equal(output.result.trim(), '42');
      } finally {
        socket.off('executeResult', onProgress);
      }
    });
  }
  const { S3Service } = require('../dist/s3/s3.service');
  const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
  const endpoint = new URL(process.env.S3_ENDPOINT);
  assert.match(endpoint.hostname, /^(localhost|127\.0\.0\.1)$/);
  const objectKey = `migration/${userUuid}.txt`;
  let objectUrl;
  test('real MinIO upload is readable over HTTP', async () => {
    objectUrl = await app
      .get(S3Service)
      .upload(objectKey, Buffer.from('nest12-storage'), 'text/plain');
    const response = await fetch(objectUrl);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'nest12-storage');
  });
  test('real MinIO deletion removes the uploaded object', async () => {
    await app.get(S3Service).removeObject(objectUrl);
    const response = await fetch(objectUrl);
    assert.equal(
      response.status,
      404,
      'S3Service must remove the same key used for upload',
    );
  });
  after(async () => {
    const s3 = new S3Client({
      endpoint: endpoint.href,
      region: process.env.S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_PROBLEM_BUCKET_NAME,
          Key: objectKey,
        }),
      );
    } finally {
      s3.destroy();
    }
  });

  test(
    'real compiler receives execute submissions through the gateway',
    { timeout: 10000 },
    async () => {
      const response = await within(
        socket.timeout(6000).emitWithAck('execute', {
          provider: 'Python',
          code: 'print(42)',
          inputList: [{ seq: 1, input: '' }],
        }),
        'gateway execution acknowledgment',
      );
      assert.equal(
        (response.data ?? response).code,
        '0000',
        'a valid execution request must reach the compiler',
      );
    },
  );
}

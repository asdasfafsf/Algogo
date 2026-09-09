const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { parseEnv } = require('node:util');
const { test } = require('node:test');

test('환경 변수를 미리 주입하지 않아도 환경 파일에서 Redis 설정을 읽고 기동한다', () => {
  const values = parseEnv(readFileSync('.test.env', 'utf8'));
  const database = new URL(values.DATABASE_URL);
  assert.match(database.hostname, /^(localhost|127\.0\.0\.1)$/);
  assert.equal(database.pathname, '/algogo_nest12_test');
  assert.match(values.REDIS_HOST, /^(localhost|127\.0\.0\.1)$/);
  assert.match(values.BULLMQ_HOST, /^(localhost|127\.0\.0\.1)$/);
  const env = { ...process.env };
  for (const key of Object.keys(values)) delete env[key];
  delete env.NODE_OPTIONS;
  env.NODE_ENV = 'test';
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
    const assert = require('node:assert/strict');
    assert.equal(process.env.REDIS_PORT, undefined);
    const { NestFactory } = require('@nestjs/core');
    const { AppModule } = require('./dist/app.module');
    const constants = require('./dist/redis/redis.constants');
    (async () => {
      const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
      try {
        app.get('winston').silent = true;
        await app.init();
        for (const key of ['REDIS_CLIENT', 'REDIS_PUB_CLIENT', 'REDIS_SUB_CLIENT']) {
          assert.equal(await app.get(constants[key]).ping(), 'PONG');
        }
      } finally {
        await app.close();
      }
    })().catch(error => { console.error(error.message); process.exit(1); });
  `,
    ],
    { env, encoding: 'utf8', timeout: 20000 },
  );
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
});

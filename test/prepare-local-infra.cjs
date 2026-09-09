const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { parseEnv } = require('node:util');
const {
  S3Client,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} = require('@aws-sdk/client-s3');

async function main() {
  const port = (service, internal) =>
    execFileSync(
      'rtk',
      [
        'proxy',
        'docker',
        'compose',
        '-f',
        'compose.nest12.yml',
        'port',
        service,
        String(internal),
      ],
      { encoding: 'utf8' },
    )
      .trim()
      .split(':')
      .pop();
  const env = parseEnv(fs.readFileSync('.test.env.example', 'utf8'));
  Object.assign(env, {
    NODE_ENV: 'test',
    SERVER_PORT: '0',
    DATABASE_URL: `mysql://root:nest12-local-only@127.0.0.1:${port('mysql', 3306)}/algogo_nest12_test`,
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: port('redis', 6379),
    REDIS_PASSWORD: 'nest12-local-only',
    BULLMQ_HOST: '127.0.0.1',
    BULLMQ_PORT: port('redis', 6379),
    BULLMQ_PASSWORD: 'nest12-local-only',
    BULLMQ_QUEUE_NAME: 'execute',
    S3_ENDPOINT: `http://127.0.0.1:${port('minio', 9000)}`,
    S3_ACCESS_KEY: 'nest12-access',
    S3_SECRET_KEY: 'nest12-secret-local-only',
    S3_PROBLEM_BUCKET_NAME: 'nest12-test',
    S3_REGION: 'us-east-1',
    ENCRYPT_KEY: Buffer.alloc(32, 1).toString('base64'),
    ENCRYPT_IV: Buffer.alloc(16, 2).toString('base64'),
    PREV_ENCRYPT_KEY: Buffer.alloc(32, 3).toString('base64'),
    PREV_ENCRYPT_IV: Buffer.alloc(16, 4).toString('base64'),
  });
  fs.writeFileSync(
    '.test.env',
    Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n',
  );
  const s3 = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
  });
  try {
    try {
      await s3.send(
        new CreateBucketCommand({ Bucket: env.S3_PROBLEM_BUCKET_NAME }),
      );
    } catch (error) {
      if (
        !['BucketAlreadyOwnedByYou', 'BucketAlreadyExists'].includes(error.name)
      )
        throw error;
    }
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: env.S3_PROBLEM_BUCKET_NAME,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${env.S3_PROBLEM_BUCKET_NAME}/*`],
            },
          ],
        }),
      }),
    );
  } finally {
    s3.destroy();
  }
  console.log('Prepared .test.env and a local public-read MinIO test bucket.');
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

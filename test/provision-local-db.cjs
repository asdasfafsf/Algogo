const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const database = new URL(process.env.DATABASE_URL);
assert.equal(process.env.NODE_ENV, 'test');
assert.match(database.hostname, /^(localhost|127\.0\.0\.1)$/);
assert.equal(database.pathname, '/algogo_nest12_test');
execFileSync(
  'rtk',
  [
    'proxy',
    process.execPath,
    'node_modules/prisma/build/index.js',
    'db',
    'push',
    '--skip-generate',
  ],
  { stdio: 'inherit' },
);
const prisma = new PrismaClient();
(async () => {
  try {
    const indexes = await prisma.$queryRawUnsafe(
      "SHOW INDEX FROM PROBLEM_V2 WHERE Index_type = 'FULLTEXT'",
    );
    if (!indexes.length) {
      await prisma.$executeRawUnsafe(
        'CREATE FULLTEXT INDEX nest12_title_ngram ON PROBLEM_V2 (PROBLEM_V2_TITLE) WITH PARSER ngram',
      );
    }
    console.log('Local schema and ngram full-text search index are ready.');
  } finally {
    await prisma.$disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

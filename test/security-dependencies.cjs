const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createServer } = require('node:http');
const { createRequire } = require('node:module');
const { finished } = require('node:stream/promises');
const axios = require('axios');
const sharp = require('sharp');
const platformRequire = createRequire(
  require.resolve('@nestjs/platform-express'),
);
const multer = platformRequire('multer');
const { MULTER_OPTION } = require('../dist/me/me.constants');
const { ImageService } = require('../dist/image/image.service');

async function serve(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}

test(
  'multipart parser rejects malformed input and still converts a valid image',
  { timeout: 10000 },
  async () => {
    const upload = multer(MULTER_OPTION).single('file');
    const images = new ImageService();
    await serve(
      (req, res) => {
        upload(req, res, (error) => {
          if (error || !req.file) {
            res.writeHead(400).end();
            return;
          }
          images.toWebp(req.file.buffer).then(
            (buffer) =>
              res.writeHead(200, { 'Content-Type': 'image/webp' }).end(buffer),
            () => res.writeHead(400).end(),
          );
        });
      },
      async (url) => {
        for (const [type, body] of [
          ['multipart/form-data', 'missing boundary'],
          [
            'multipart/form-data; boundary=x',
            '--x\r\nContent-Disposition: form-data; name="file"; filename="a.png"\r\nContent-Type: image/png\r\n\r\ntruncated',
          ],
        ]) {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': type },
            body,
            signal: AbortSignal.timeout(3000),
          });
          assert.equal(response.status, 400);
          await response.arrayBuffer();
        }
        const invalid = new FormData();
        invalid.set(
          'file',
          new Blob(['not an image'], { type: 'image/png' }),
          'invalid.png',
        );
        const rejected = await fetch(url, {
          method: 'POST',
          body: invalid,
          signal: AbortSignal.timeout(3000),
        });
        assert.equal(rejected.status, 400);
        await rejected.arrayBuffer();
        const png = await sharp({
          create: { width: 2, height: 2, channels: 3, background: '#abcdef' },
        })
          .png()
          .toBuffer();
        const valid = new FormData();
        valid.set('file', new Blob([png], { type: 'image/png' }), 'valid.png');
        const response = await fetch(url, {
          method: 'POST',
          body: valid,
          signal: AbortSignal.timeout(3000),
        });
        assert.equal(response.status, 200);
        const metadata = await sharp(
          Buffer.from(await response.arrayBuffer()),
        ).metadata();
        assert.equal(metadata.format, 'webp');
        assert.equal(metadata.width, 2);
      },
    );
  },
);

test(
  'Axios enforces response limits for buffered and streamed responses',
  { timeout: 10000 },
  async () => {
    await serve(
      (req, res) => {
        if (req.url === '/userinfo') {
          assert.equal(req.headers.authorization, 'Bearer test-token');
          res
            .writeHead(200, { 'Content-Type': 'application/json' })
            .end('{"sub":"user-1"}');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.write('a'.repeat(64));
          res.end('b'.repeat(64));
        }
      },
      async (url) => {
        const client = axios.create({ proxy: false, timeout: 3000 });
        await assert.rejects(
          client.get(url, { maxContentLength: 16 }),
          /maxContentLength/,
        );
        const response = await client.get(url, {
          responseType: 'stream',
          maxContentLength: 16,
        });
        const complete = finished(response.data);
        response.data.resume();
        await assert.rejects(complete, /maxContentLength/);
        const user = await client.get(`${url}/userinfo`, {
          headers: { Authorization: 'Bearer test-token' },
        });
        assert.deepEqual(user.data, { sub: 'user-1' });
      },
    );
  },
);

test(
  'updated tracing packages start and export a real span locally',
  { timeout: 10000 },
  async () => {
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const {
      getNodeAutoInstrumentations,
    } = require('@opentelemetry/auto-instrumentations-node');
    const {
      OTLPTraceExporter,
    } = require('@opentelemetry/exporter-trace-otlp-http');
    const { resourceFromAttributes } = require('@opentelemetry/resources');
    const { trace } = require('@opentelemetry/api');
    let requests = 0;
    await serve(
      (req, res) => {
        requests += 1;
        assert.equal(req.url, '/v1/traces');
        req.resume();
        req.on('end', () =>
          res.writeHead(200, { 'Content-Type': 'application/json' }).end('{}'),
        );
      },
      async (url) => {
        const sdk = new NodeSDK({
          autoDetectResources: false,
          resource: resourceFromAttributes({
            'service.name': 'algogo-security-test',
          }),
          traceExporter: new OTLPTraceExporter({ url: `${url}/v1/traces` }),
          instrumentations: [
            getNodeAutoInstrumentations({
              '@opentelemetry/instrumentation-fs': { enabled: false },
              '@opentelemetry/instrumentation-dns': { enabled: false },
            }),
          ],
        });
        sdk.start();
        try {
          trace
            .getTracer('security-test')
            .startSpan('patched-dependencies')
            .end();
        } finally {
          await sdk.shutdown();
        }
        assert.ok(requests > 0, 'a span must reach the local collector');
      },
    );
  },
);

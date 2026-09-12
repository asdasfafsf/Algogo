import { createServer } from 'node:http';
import pino from 'pino';
import type { LokiOptions } from 'pino-loki';

describe('Pino Loki transport', () => {
  it('종료 전에 로그를 Loki HTTP endpoint로 전송한다', async () => {
    let body = '';
    let authorization = '';
    let resolveReceived: () => void;
    const received = new Promise<void>((resolve) => {
      resolveReceived = resolve;
    });
    const server = createServer((request, response) => {
      authorization = request.headers.authorization ?? '';
      request.setEncoding('utf8');
      request.on('data', (chunk: string) => (body += chunk));
      request.on('end', () => {
        response.writeHead(204).end();
        resolveReceived();
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('포트 할당 실패');

    const transport = pino.transport<LokiOptions>({
      target: 'pino-loki',
      options: {
        host: `http://127.0.0.1:${address.port}`,
        basicAuth: { username: 'test-user', password: 'test-password' },
        batching: false,
      },
    });
    const logger = pino(transport);

    logger.info({ requestId: 'request-1' }, 'Loki 전송 확인');
    await new Promise<void>((resolve, reject) =>
      logger.flush((error) => (error ? reject(error) : resolve())),
    );
    await received;
    const closed = new Promise<void>((resolve) =>
      transport.once('close', resolve),
    );
    transport.end();
    await closed;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );

    expect(authorization).toBe(
      `Basic ${Buffer.from('test-user:test-password').toString('base64')}`,
    );
    expect(body).toContain('Loki 전송 확인');
    expect(body).toContain('request-1');
  }, 10_000);
});

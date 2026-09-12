import { createServer } from 'node:http';
import type { ClsService } from 'nestjs-cls';
import { AppLogger } from './app-logger';
import { createPinoResources, PinoLifecycle } from './logger.module';

describe('Pino logger resources', () => {
  it('trace 로그를 가린 뒤 종료 전에 Loki로 전송하고 transport를 닫는다', async () => {
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
        response.writeHead(204, { Connection: 'close' }).end();
        resolveReceived();
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('포트 할당 실패');

    const resources = createPinoResources({
      enabled: true,
      host: `http://127.0.0.1:${address.port}`,
      username: 'test-user',
      password: 'test-password',
    });
    const cls = {
      get: jest.fn((key: string) =>
        key === 'requestId' ? 'request-1' : 'trace-1',
      ),
    } as unknown as ClsService;
    const logger = new AppLogger(resources.logger, cls);

    logger.silly('Loki 전송 확인', {
      password: 'secret-password',
      headers: { authorization: 'Bearer secret-token' },
    });
    await Promise.all([
      new PinoLifecycle(resources).onApplicationShutdown(),
      received,
    ]);
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );

    expect(authorization).toBe(
      `Basic ${Buffer.from('test-user:test-password').toString('base64')}`,
    );
    expect(body).toContain('Loki 전송 확인');
    expect(body).toContain('request-1');
    expect(body).toContain('trace-1');
    expect(body).toContain('[REDACTED]');
    expect(body).not.toContain('secret-password');
    expect(body).not.toContain('secret-token');
  }, 10_000);
});

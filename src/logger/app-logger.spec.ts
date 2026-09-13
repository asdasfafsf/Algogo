import { Writable } from 'node:stream';
import pino from 'pino';
import { ClsService } from 'nestjs-cls';
import { AppLogger } from './app-logger';

describe('AppLogger', () => {
  it('Pino JSON 로그에 CLS 추적 정보와 메타데이터를 보존하고 비밀값을 가린다', () => {
    let output = '';
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });
    const logger = pino(
      {
        base: null,
        timestamp: false,
        redact: {
          paths: ['password', 'headers.authorization'],
          censor: '[REDACTED]',
        },
      },
      stream,
    );
    const cls = {
      get: jest.fn((key: string) =>
        key === 'requestId' ? 'request-1' : 'trace-1',
      ),
    } as unknown as ClsService;
    const appLogger = new AppLogger(logger, cls);
    appLogger.setContext('TestContext');

    appLogger.log('저장 완료', {
      userUuid: 'user-1',
      password: 'secret',
      headers: { authorization: 'Bearer secret' },
    });

    expect(JSON.parse(output)).toMatchObject({
      level: 30,
      msg: '저장 완료',
      requestId: 'request-1',
      traceId: 'trace-1',
      context: 'TestContext',
      userUuid: 'user-1',
      password: '[REDACTED]',
      headers: { authorization: '[REDACTED]' },
    });
  });
});

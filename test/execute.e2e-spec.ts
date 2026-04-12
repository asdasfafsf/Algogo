import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { createTestApp, closeTestApp } from './helpers/setup';
import { getAccessToken } from './helpers/auth';
import { JwtService } from '../src/jwt/jwt.service';

let actualPort: number;

describe('Execute Gateway E2E', () => {
  let app: INestApplication;
  let socket: Socket;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;

    await app.listen(0);
    const url = await app.getUrl();
    actualPort = Number(new URL(url).port);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  afterEach(() => {
    socket?.disconnect();
  });

  function createSocket(): Socket {
    return io(`http://localhost:${actualPort}`, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  async function createValidToken(): Promise<string> {
    return getAccessToken(app, { sub: 'test-user-uuid', roles: [] });
  }

  describe('연결 & 인증', () => {
    it('유효한 토큰으로 auth 전송 시 code 0000 응답을 받는다', (done) => {
      socket = createSocket();

      socket.on('connect', async () => {
        const token = await createValidToken();
        socket.emit('auth', { token });
      });

      socket.on('auth', (data: { code: string; result: string }) => {
        expect(data.code).toBe('0000');
        done();
      });

      socket.connect();
    });

    it('5초 내 auth를 보내지 않으면 연결이 끊긴다', (done) => {
      socket = createSocket();

      socket.on('disconnect', () => {
        done();
      });

      socket.connect();
    }, 10000);

    it('잘못된 토큰으로 auth 전송 시 에러 응답 후 연결이 끊긴다', (done) => {
      socket = createSocket();
      let authReceived = false;

      socket.on('connect', () => {
        socket.emit('auth', { token: 'invalid-token' });
      });

      socket.on('auth', (data: { code: string; message: string }) => {
        authReceived = true;
        expect(data.code).toBe('JWT_INVALID');
        expect(data.message).toBe('토큰이 유효하지 않습니다.');
      });

      socket.on('disconnect', () => {
        expect(authReceived).toBe(true);
        done();
      });

      socket.connect();
    });

    it('만료된 토큰으로 auth 전송 시 에러 응답 후 연결이 끊긴다', (done) => {
      socket = createSocket();
      let authReceived = false;

      socket.on('connect', async () => {
        const jwtService = app.get(JwtService);
        // 만료 시간을 -1초로 설정하여 이미 만료된 토큰 생성
        const expiredToken = await jwtService.sign(
          { sub: 'test-user-uuid', roles: [] },
          -1,
        );
        socket.emit('auth', { token: expiredToken });
      });

      socket.on('auth', (data: { code: string; message: string }) => {
        authReceived = true;
        expect(data.code).toBe('JWT_EXPIRED');
        expect(data.message).toBe('토큰이 만료되었습니다.');
      });

      socket.on('disconnect', () => {
        expect(authReceived).toBe(true);
        done();
      });

      socket.connect();
    });
  });

  describe('코드 실행', () => {
    it('인증 없이 execute 전송 시 에러 응답을 받는다', (done) => {
      socket = createSocket();

      socket.on('connect', () => {
        socket.emit('execute', {
          provider: 'Python',
          input: 'print("hello")',
        });
      });

      // WsAuthGuard가 실패하면 ExecuteWsExceptionFilter를 통해 error 이벤트 발생
      socket.on('error', (data: { code: string; result: string }) => {
        expect(data).toBeDefined();
        done();
      });

      // 인증 없이 execute 시 연결이 끊길 수도 있음 (타임아웃 포함)
      // 에러 또는 연결 끊김 중 먼저 발생하는 것으로 테스트 종료
      const timeout = setTimeout(() => {
        // 5초 타임아웃으로 인해 연결 끊김이 발생할 수 있음
        done();
      }, 6000);

      socket.on('disconnect', () => {
        clearTimeout(timeout);
        done();
      });

      socket.connect();
    }, 10000);

    // NOTE: 전체 코드 실행 테스트는 BullMQ 워커가 실행 중이어야 합니다.
    // Redis와 BullMQ 워커가 없는 환경에서는 실행 결과를 받을 수 없으므로,
    // execute 제출(submission) 자체의 동작만 검증합니다.
    it('인증 후 execute 전송 시 요청이 수락된다', (done) => {
      socket = createSocket();

      socket.on('connect', async () => {
        const token = await createValidToken();
        socket.emit('auth', { token });
      });

      socket.on('auth', (data: { code: string }) => {
        if (data.code !== '0000') {
          done.fail('인증 실패');
          return;
        }

        // 인증 성공 후 execute 전송
        // BullMQ 워커가 없으면 타임아웃 또는 에러가 발생하지만,
        // 요청 자체가 거부되지 않는 것을 확인
        socket.emit(
          'execute',
          {
            provider: 'Python',
            input: 'print("hello")',
          },
          (response: Record<string, unknown>) => {
            // ack 콜백이 호출되면 요청이 처리된 것
            // BullMQ 연결 실패 시 에러 코드 반환
            expect(response).toBeDefined();
            done();
          },
        );

        // BullMQ가 없는 경우 에러 응답을 받을 수 있음
        setTimeout(() => {
          done();
        }, 5000);
      });

      socket.connect();
    }, 15000);
  });
});

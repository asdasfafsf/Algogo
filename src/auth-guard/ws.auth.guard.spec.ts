import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { WsAuthGuard } from './ws.auth.guard';
import { JwtService } from '../jwt/jwt.service';
import { CustomLogger } from '../logger/custom-logger';

describe('WsAuthGuard', () => {
  let guard: WsAuthGuard;

  /* ────────── Mock 정의 ────────── */
  const mockJwtService = {
    verify: jest.fn(),
  };
  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as CustomLogger;

  /* ────────── Helper: Context Mock ────────── */
  const createWsContext = (client: any): ExecutionContext =>
    ({
      switchToWs: () => ({
        getClient: () => client,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: CustomLogger, useValue: mockLogger },
      ],
    }).compile();

    guard = module.get<WsAuthGuard>(WsAuthGuard);
  });

  /* ───────────────────────────────
        1) 정상 토큰 → true 리턴
  ─────────────────────────────── */
  it('유효한 토큰이면 true를 반환하고 client.user에 페이로드를 저장한다', async () => {
    // Arrange
    const tokenPayload = { sub: 'uuid-123' };
    mockJwtService.verify.mockResolvedValue(tokenPayload);

    const client: any = { token: 'valid-token' };
    const context = createWsContext(client);

    // Act
    const result = await guard.canActivate(context);

    // Assert
    expect(result).toBe(true);
    expect(client.user).toEqual(tokenPayload);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
  });

  /* ───────────────────────────────
        2) 토큰 없음 → WsException
  ─────────────────────────────── */
  it('토큰이 없으면 WsException을 던진다', async () => {
    const client: any = {}; // token 필드 없음
    const context = createWsContext(client);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      WsException,
    );
    expect(mockJwtService.verify).not.toHaveBeenCalled();
  });

  /* ───────────────────────────────
        3) verify() 실패 → 예외 전파
  ─────────────────────────────── */
  it('JwtService.verify()가 예외를 던지면 그대로 전파한다', async () => {
    const client: any = { token: 'bad-token' };
    const context = createWsContext(client);

    mockJwtService.verify.mockRejectedValue(new Error('invalid'));

    await expect(guard.canActivate(context)).rejects.toThrow('invalid');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { AuthV2Service } from './auth-v2.service';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import JwtConfig from '../config/jwtConfig';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';
import { CustomLogger } from '../logger/custom-logger';
import { Role } from '../common/types/roles.type';

describe('AuthV2Service 단위 테스트', () => {
  let authService: AuthV2Service;

  /* ────────────────────────
     의존성(mock) 정의
  ──────────────────────── */
  const mockJwtService: Partial<JwtService> = {
    sign: jest.fn(),
  };

  const mockUsersService: Partial<UsersService> = {
    validateUser: jest.fn(),
    insertLoginHistory: jest.fn(),
  };

  const mockCache: Partial<Cache> = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockLogger: Partial<CustomLogger> = {
    log: jest.fn(),
  };

  const mockJwtConfig = {
    jwtAccessTokenExpiresIn: 3600, // 1h (초 단위)
    jwtRefreshTokenExpiresIn: 3600 * 24 * 7, // 7d (초 단위)
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthV2Service,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: JwtConfig.KEY, useValue: mockJwtConfig },
        { provide: CustomLogger, useValue: mockLogger },
      ],
    }).compile();

    authService = module.get<AuthV2Service>(AuthV2Service);
  });

  /* ────────────────────────
        login()
  ──────────────────────── */
  it('login() : 유효한 사용자일 때 토큰을 발급하고 캐시에 저장한다', async () => {
    // Arrange
    const userUuid = 'uuid-123';
    const accessToken = 'access';
    const refreshToken = 'refresh';

    (mockUsersService.validateUser as jest.Mock).mockResolvedValue({
      uuid: userUuid,
    });
    (mockJwtService.sign as jest.Mock)
      .mockResolvedValueOnce(accessToken) // access
      .mockResolvedValueOnce(refreshToken); // refresh

    // Act
    const result = await authService.login({
      userUuid,
      ip: '127.0.0.1',
      userAgent: 'test',
    });

    // Assert
    expect(result).toEqual({ accessToken, refreshToken });
    expect(mockUsersService.validateUser).toHaveBeenCalledWith(userUuid);
    expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    // cache-manager 7.0.0에서는 TTL이 밀리초 단위
    expect(mockCache.set).toHaveBeenCalledWith(
      `${userUuid}:${refreshToken}`,
      true,
      mockJwtConfig.jwtRefreshTokenExpiresIn * 1000 + 10000, // 초를 밀리초로 변환
    );
  });

  /* ────────────────────────
        refresh() 성공
  ──────────────────────── */
  it('refresh() : 캐시에 존재하는 리프레시 토큰이면 새 토큰을 발급한다', async () => {
    // Arrange
    const userUuid = 'uuid-123';
    const oldRefreshToken = 'oldRefresh';
    const newAccessToken = 'newAccess';
    const newRefreshToken = 'newRefresh';

    (mockUsersService.validateUser as jest.Mock).mockResolvedValue({
      uuid: userUuid,
    });
    (mockCache.get as jest.Mock).mockResolvedValue(true); // 캐시된 값은 true
    (mockJwtService.sign as jest.Mock)
      .mockResolvedValueOnce(newAccessToken)
      .mockResolvedValueOnce(newRefreshToken);

    // Act
    const result = await authService.refresh({
      userUuid,
      refreshToken: oldRefreshToken,
      ip: '127.0.0.1',
      userAgent: 'test',
    });

    // Assert
    expect(result).toEqual({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    expect(mockCache.del).toHaveBeenCalledWith(
      `${userUuid}:${oldRefreshToken}`,
    );
    // cache-manager 7.0.0에서는 TTL이 밀리초 단위
    expect(mockCache.set).toHaveBeenCalledWith(
      `${userUuid}:${newRefreshToken}`,
      true,
      mockJwtConfig.jwtRefreshTokenExpiresIn * 1000 + 10000, // 초를 밀리초로 변환
    );
  });

  /* ────────────────────────
        refresh() 실패
  ──────────────────────── */
  it('refresh() : 캐시에 토큰이 없으면 JwtInvalidTokenException을 던진다', async () => {
    // Arrange
    const userUuid = 'uuid-123';
    const invalidRefreshToken = 'invalid';
    (mockUsersService.validateUser as jest.Mock).mockResolvedValue({
      uuid: userUuid,
    });
    (mockCache.get as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(
      authService.refresh({
        userUuid,
        refreshToken: invalidRefreshToken,
        ip: '127.0.0.1',
        userAgent: 'test',
      }),
    ).rejects.toBeInstanceOf(JwtInvalidTokenException);

    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  /* ────────────────────────
        validateRefreshToken() 성공
  ──────────────────────── */
  it('validateRefreshToken() : 캐시에 토큰이 존재하면 토큰을 반환한다', async () => {
    // Arrange
    const userUuid = 'uuid-123';
    const refreshToken = 'refresh';
    (mockCache.get as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await authService.validateRefreshToken(
      userUuid,
      refreshToken,
    );

    // Assert
    expect(result).toBe(true);
    expect(mockCache.get).toHaveBeenCalledWith(`${userUuid}:${refreshToken}`);
  });

  /* ────────────────────────
        validateRefreshToken() 실패
  ──────────────────────── */
  it('validateRefreshToken() : 캐시에 토큰이 없으면 JwtInvalidTokenException을 던진다', async () => {
    // Arrange
    const userUuid = 'uuid-123';
    const refreshToken = 'refresh';
    (mockCache.get as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(
      authService.validateRefreshToken(userUuid, refreshToken),
    ).rejects.toBeInstanceOf(JwtInvalidTokenException);

    expect(mockCache.get).toHaveBeenCalledWith(`${userUuid}:${refreshToken}`);
  });

  /* ────────────────────────
        generateToken()
  ──────────────────────── */
  it('generateToken() : 액세스 토큰과 리프레시 토큰을 생성한다', async () => {
    // Arrange
    const payload = { sub: 'uuid-123', roles: ['VIP'] as Role[] };
    const accessToken = 'access';
    const refreshToken = 'refresh';

    (mockJwtService.sign as jest.Mock)
      .mockResolvedValueOnce(accessToken)
      .mockResolvedValueOnce(refreshToken);

    // Act
    const result = await authService.generateToken(payload);

    // Assert
    expect(result).toEqual({ accessToken, refreshToken });
    expect(mockJwtService.sign).toHaveBeenCalledTimes(2);

    // 액세스 토큰: roles 포함
    expect(mockJwtService.sign).toHaveBeenNthCalledWith(
      1,
      {
        sub: payload.sub,
        roles: payload.roles,
      },
      mockJwtConfig.jwtAccessTokenExpiresIn,
    );

    // 리프레시 토큰: roles 제외 (sub만 포함)
    expect(mockJwtService.sign).toHaveBeenNthCalledWith(
      2,
      {
        sub: payload.sub,
      },
      mockJwtConfig.jwtRefreshTokenExpiresIn,
    );
  });
});

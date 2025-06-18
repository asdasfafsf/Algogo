import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { AuthV2Service } from './auth-v2.service';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import JwtConfig from '../config/jwtConfig';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';

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
  };

  const mockCache: Partial<Cache> = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockJwtConfig = {
    jwtAccessTokenExpiresIn: 3600, // 1h
    jwtRefreshTokenExpiresIn: 3600 * 24 * 7, // 7d
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
    const result = await authService.login({ userUuid });

    // Assert
    expect(result).toEqual({ accessToken, refreshToken });
    expect(mockUsersService.validateUser).toHaveBeenCalledWith(userUuid);
    expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    expect(mockCache.set).toHaveBeenCalledWith(
      `${userUuid}:${refreshToken}`,
      refreshToken,
      mockJwtConfig.jwtRefreshTokenExpiresIn + 1,
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
    (mockCache.get as jest.Mock).mockResolvedValue(oldRefreshToken);
    (mockJwtService.sign as jest.Mock)
      .mockResolvedValueOnce(newAccessToken)
      .mockResolvedValueOnce(newRefreshToken);

    // Act
    const result = await authService.refresh({
      userUuid,
      refreshToken: oldRefreshToken,
    });

    // Assert
    expect(result).toEqual({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    expect(mockCache.del).toHaveBeenCalledWith(
      `${userUuid}:${oldRefreshToken}`,
    );
    expect(mockCache.set).toHaveBeenCalledWith(
      `${userUuid}:${newRefreshToken}`,
      newRefreshToken,
      mockJwtConfig.jwtRefreshTokenExpiresIn + 1,
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
      authService.refresh({ userUuid, refreshToken: invalidRefreshToken }),
    ).rejects.toBeInstanceOf(JwtInvalidTokenException);

    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });
});

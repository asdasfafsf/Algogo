import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { DecodeGuard } from './decode-guard';
import { JwtService } from '../jwt/jwt.service';
import { JwtTokenExpiredException } from '../common/errors/token/JwtTokenExpiredException';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';

describe('DecodeGuard 단위 테스트', () => {
  let guard: DecodeGuard;

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecodeGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<DecodeGuard>(DecodeGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (
    headers: any = {},
    cookies: any = {},
  ): ExecutionContext => {
    const mockRequest = {
      headers,
      cookies,
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('유효한 access_token 쿠키가 있으면 user를 설정하고 true를 반환한다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        {}, // headers
        { access_token: 'valid-access-token' }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-access-token');
      expect(request.user).toEqual(mockPayload);
    });

    it('토큰이 없으면 user를 null로 설정하고 true를 반환한다', async () => {
      // Arrange
      const mockContext = createMockContext({}, {});

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
      expect(request.user).toBeNull();
    });

    it('access_token 쿠키가 Authorization 헤더보다 우선순위가 높다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        { authorization: 'Bearer header-token' }, // headers
        { access_token: 'cookie-access-token' }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('cookie-access-token');
    });

    it('Authorization 헤더로 Bearer 토큰을 파싱할 수 있다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        { authorization: 'Bearer valid-header-token' }, // headers
        {}, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-header-token');
      expect(request.user).toEqual(mockPayload);
    });

    it('authorization 쿠키로 Bearer 토큰을 파싱할 수 있다 (하위 호환성)', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        {}, // headers
        { authorization: 'Bearer cookie-bearer-token' }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('cookie-bearer-token');
      expect(request.user).toEqual(mockPayload);
    });

    it('토큰 파싱 우선순위가 올바르다: access_token 쿠키 > Authorization 헤더 > authorization 쿠키', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };

      // Test case: 모든 토큰이 있을 때 access_token 쿠키가 우선
      const mockContext = createMockContext(
        { authorization: 'Bearer header-token' }, // headers
        {
          access_token: 'access-cookie-token',
          authorization: 'Bearer auth-cookie-token',
        }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('access-cookie-token');
    });

    it('JWT 검증에 실패하면 예외를 던진다 (로그아웃 확인을 위해)', async () => {
      // Arrange
      const mockContext = createMockContext(
        {},
        { access_token: 'invalid-token' },
      );

      mockJwtService.verify.mockRejectedValue(new JwtInvalidTokenException());

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtInvalidTokenException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith('invalid-token');
    });

    it('JWT 토큰이 만료되면 예외를 던진다 (로그아웃 확인을 위해)', async () => {
      // Arrange
      const mockContext = createMockContext(
        {},
        { access_token: 'expired-token' },
      );

      mockJwtService.verify.mockRejectedValue(new JwtTokenExpiredException());

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtTokenExpiredException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith('expired-token');
    });

    it('Bearer 접두사가 없는 Authorization 헤더는 무시한다', async () => {
      // Arrange
      const mockContext = createMockContext(
        { authorization: 'invalid-token' }, // headers
        {}, // cookies
      );

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
      expect(request.user).toBeNull();
    });

    it('빈 토큰들은 모두 무시한다', async () => {
      // Arrange
      const mockContext = createMockContext(
        { authorization: 'Bearer ' }, // headers
        {
          access_token: '',
          authorization: 'Bearer ',
        }, // cookies
      );

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
      expect(request.user).toBeNull();
    });
  });
});

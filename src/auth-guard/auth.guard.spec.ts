import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '../jwt/jwt.service';
import { JwtTokenExpiredException } from '../common/errors/token/JwtTokenExpiredException';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';
import { JwtMissingTokenException } from '../common/errors/token/JwtMissingTokenException';

describe('AuthGuard 단위 테스트', () => {
  let guard: AuthGuard;

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
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
    it('유효한 Bearer 토큰이 있으면 true를 반환한다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext({
        authorization: 'Bearer valid-token',
      });

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(request.user).toEqual(mockPayload);
    });

    it('Authorization 헤더가 없으면 JwtMissingTokenException을 던진다', async () => {
      // Arrange
      const mockContext = createMockContext({});

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtMissingTokenException,
      );

      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('Bearer 접두사가 없으면 JwtMissingTokenException을 던진다', async () => {
      // Arrange
      const mockContext = createMockContext({
        authorization: 'invalid-token',
      });

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtMissingTokenException,
      );

      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('Bearer 뒤에 토큰이 없으면 JwtMissingTokenException을 던진다', async () => {
      // Arrange
      const mockContext = createMockContext({
        authorization: 'Bearer',
      });

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtMissingTokenException,
      );

      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('Bearer 뒤에 빈 토큰이 있으면 JwtMissingTokenException을 던진다', async () => {
      // Arrange
      const mockContext = createMockContext({
        authorization: 'Bearer ',
      });

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtMissingTokenException,
      );

      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('JWT 검증에 실패하면 JwtInvalidTokenException을 던진다', async () => {
      // Arrange
      const mockContext = createMockContext({
        authorization: 'Bearer invalid-token',
      });

      mockJwtService.verify.mockRejectedValue(new JwtInvalidTokenException());

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtInvalidTokenException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith('invalid-token');
    });

    it('JWT 토큰이 만료되면 JwtTokenExpiredException을 던진다', async () => {
      // Arrange
      const mockContext = createMockContext({
        authorization: 'Bearer expired-token',
      });

      mockJwtService.verify.mockRejectedValue(new JwtTokenExpiredException());

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        JwtTokenExpiredException,
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith('expired-token');
    });

    it('쿠키에서 Bearer 토큰을 추출할 수 있다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        {}, // headers
        { authorization: 'Bearer cookie-token' }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('cookie-token');
      expect(request.user).toEqual(mockPayload);
    });

    it('헤더 토큰이 우선순위가 높다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        { authorization: 'Bearer header-token' }, // headers
        { authorization: 'Bearer cookie-token' }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('header-token');
    });

    // 새로운 쿠키 토큰 파싱 테스트들
    it('쿠키의 access_token을 우선적으로 파싱한다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        {}, // headers
        { access_token: 'cookie-access-token' }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('cookie-access-token');
      expect(request.user).toEqual(mockPayload);
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

    it('access_token 쿠키가 authorization 쿠키보다 우선순위가 높다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const mockContext = createMockContext(
        {}, // headers
        {
          access_token: 'new-cookie-token',
          authorization: 'Bearer old-cookie-token',
        }, // cookies
      );

      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('new-cookie-token');
    });

    it('토큰 파싱 우선순위가 올바르다: access_token 쿠키 > Authorization 헤더 > authorization 쿠키', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };

      // Test case 1: access_token 쿠키만 있을 때
      const mockContext1 = createMockContext(
        {},
        { access_token: 'access-token-cookie' },
      );
      mockJwtService.verify.mockResolvedValue(mockPayload);

      await guard.canActivate(mockContext1);
      expect(mockJwtService.verify).toHaveBeenCalledWith('access-token-cookie');

      jest.clearAllMocks();

      // Test case 2: Authorization 헤더만 있을 때
      const mockContext2 = createMockContext(
        { authorization: 'Bearer header-token' },
        {},
      );
      mockJwtService.verify.mockResolvedValue(mockPayload);

      await guard.canActivate(mockContext2);
      expect(mockJwtService.verify).toHaveBeenCalledWith('header-token');

      jest.clearAllMocks();

      // Test case 3: authorization 쿠키만 있을 때
      const mockContext3 = createMockContext(
        {},
        { authorization: 'Bearer auth-cookie-token' },
      );
      mockJwtService.verify.mockResolvedValue(mockPayload);

      await guard.canActivate(mockContext3);
      expect(mockJwtService.verify).toHaveBeenCalledWith('auth-cookie-token');
    });

    it('정확한 Bearer 대소문자만 인식한다', async () => {
      // Arrange
      const testCases = [
        'bearer token', // 소문자
        'BEARER token', // 대문자
        'Bearer token', // 정상
      ];

      for (let i = 0; i < testCases.length; i++) {
        const mockContext = createMockContext({
          authorization: testCases[i],
        });

        if (i === 2) {
          // 마지막만 성공
          const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
          mockJwtService.verify.mockResolvedValue(mockPayload);

          const result = await guard.canActivate(mockContext);
          expect(result).toBe(true);
          expect(mockJwtService.verify).toHaveBeenCalledWith('token');
        } else {
          await expect(guard.canActivate(mockContext)).rejects.toThrow(
            JwtMissingTokenException,
          );
        }

        jest.clearAllMocks();
      }
    });
  });

  describe('extractTokenFromHeader', () => {
    it('private 메서드이므로 직접 테스트하지 않고 canActivate를 통해 간접 테스트', () => {
      // extractTokenFromHeader는 private 메서드이므로
      // canActivate 테스트를 통해 충분히 검증됩니다.
      expect(true).toBe(true);
    });
  });
});

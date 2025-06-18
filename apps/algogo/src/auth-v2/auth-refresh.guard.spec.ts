import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthRefreshGuard } from './auth-refresh.guard';
import { JwtService } from '../jwt/jwt.service';
import { JwtTokenExpiredException } from '../common/errors/token/JwtTokenExpiredException';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';
import { JwtMissingTokenException } from '../common/errors/token/JwtMissingTokenException';

describe('AuthRefreshGuard 단위 테스트', () => {
  let guard: AuthRefreshGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRefreshGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<AuthRefreshGuard>(AuthRefreshGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (headers: any = {}, cookies: any = {}): ExecutionContext => {
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
    it('유효한 Bearer 토큰이 있으면 true를 반환하고 refreshToken을 포함한다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const refreshToken = 'valid-refresh-token';
      const mockContext = createMockContext({
        authorization: `Bearer ${refreshToken}`,
      });
      
      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(request.user).toEqual({
        ...mockPayload,
        refreshToken: refreshToken,
      });
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
      const refreshToken = 'cookie-refresh-token';
      const mockContext = createMockContext(
        {}, // headers
        { authorization: `Bearer ${refreshToken}` } // cookies
      );
      
      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(request.user).toEqual({
        ...mockPayload,
        refreshToken: refreshToken,
      });
    });

    it('헤더 토큰이 쿠키보다 우선순위가 높다', async () => {
      // Arrange
      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };
      const headerToken = 'header-refresh-token';
      const cookieToken = 'cookie-refresh-token';
      const mockContext = createMockContext(
        { authorization: `Bearer ${headerToken}` }, // headers
        { authorization: `Bearer ${cookieToken}` } // cookies
      );
      
      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith(headerToken);
      expect(request.user).toEqual({
        ...mockPayload,
        refreshToken: headerToken,
      });
    });

    it('정확한 Bearer 대소문자만 인식한다', async () => {
      // Arrange
      const testCases = [
        { auth: 'bearer refresh-token', shouldPass: false },
        { auth: 'BEARER refresh-token', shouldPass: false },
        { auth: 'Bearer refresh-token', shouldPass: true },
      ];

      const mockPayload = { sub: 'user-uuid', iat: 1234567890 };

      for (const testCase of testCases) {
        const mockContext = createMockContext({
          authorization: testCase.auth,
        });

        if (testCase.shouldPass) {
          mockJwtService.verify.mockResolvedValue(mockPayload);
          
          const result = await guard.canActivate(mockContext);
          const request = mockContext.switchToHttp().getRequest();
          
          expect(result).toBe(true);
          expect(mockJwtService.verify).toHaveBeenCalledWith('refresh-token');
          expect(request.user).toEqual({
            ...mockPayload,
            refreshToken: 'refresh-token',
          });
        } else {
          await expect(guard.canActivate(mockContext)).rejects.toThrow(
            JwtMissingTokenException,
          );
        }
        
        jest.clearAllMocks();
      }
    });

    it('payload와 refreshToken이 모두 request.user에 설정된다', async () => {
      // Arrange
      const mockPayload = { 
        sub: 'user-uuid', 
        iat: 1234567890,
        exp: 1234567890 + 3600,
        customData: 'test'
      };
      const refreshToken = 'complex-refresh-token-123';
      const mockContext = createMockContext({
        authorization: `Bearer ${refreshToken}`,
      });
      
      mockJwtService.verify.mockResolvedValue(mockPayload);

      // Act
      const result = await guard.canActivate(mockContext);
      const request = mockContext.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(request.user).toEqual({
        sub: 'user-uuid',
        iat: 1234567890,
        exp: 1234567890 + 3600,
        customData: 'test',
        refreshToken: refreshToken,
      });
    });
  });
});
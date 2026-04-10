import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import {
  JwtService as NestJwtService,
  TokenExpiredError,
  JsonWebTokenError,
} from '@nestjs/jwt';
import jwtConfig from '../config/jwtConfig';
import { JwtTokenExpiredException } from '../common/errors/token/JwtTokenExpiredException';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';

describe('JwtService', () => {
  let service: JwtService;
  let nestJwtService: jest.Mocked<NestJwtService>;

  const mockConfig = {
    jwtSecret: 'test-secret',
    jwtAccessTokenExpiresIn: 3600,
    jwtRefreshTokenExpiresIn: 86400,
    prevJwtSecret: 'prev-secret',
  };

  beforeEach(async () => {
    const mockNestJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: NestJwtService, useValue: mockNestJwtService },
        { provide: jwtConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get(JwtService);
    nestJwtService = module.get(NestJwtService) as jest.Mocked<NestJwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sign', () => {
    it('토큰을 생성한다', async () => {
      // Given
      const payload = { sub: 'user-uuid' };
      nestJwtService.signAsync.mockResolvedValue('signed-token');

      // When
      const result = await service.sign(payload, 3600);

      // Then
      expect(result).toBe('signed-token');
      expect(nestJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'test-secret',
        expiresIn: 3600,
      });
    });
  });

  describe('verify', () => {
    it('유효한 토큰이면 페이로드를 반환한다', async () => {
      // Given
      const payload = { sub: 'user-uuid' };
      nestJwtService.verifyAsync.mockResolvedValue(payload);

      // When
      const result = await service.verify('valid-token');

      // Then
      expect(result).toEqual(payload);
    });

    it('만료된 토큰이면 JwtTokenExpiredException을 던진다', async () => {
      // Given
      nestJwtService.verifyAsync.mockRejectedValue(
        new TokenExpiredError('expired', new Date()),
      );

      // When & Then
      await expect(service.verify('expired-token')).rejects.toThrow(
        JwtTokenExpiredException,
      );
    });

    it('현재 시크릿 실패 시 이전 시크릿으로 재검증한다', async () => {
      // Given
      const payload = { sub: 'user-uuid' };
      nestJwtService.verifyAsync
        .mockRejectedValueOnce(new JsonWebTokenError('invalid'))
        .mockResolvedValueOnce(payload);

      // When
      const result = await service.verify('old-token');

      // Then
      expect(result).toEqual(payload);
      expect(nestJwtService.verifyAsync).toHaveBeenCalledTimes(2);
    });

    it('양쪽 시크릿 모두 실패하면 JwtInvalidTokenException을 던진다', async () => {
      // Given
      nestJwtService.verifyAsync
        .mockRejectedValueOnce(new JsonWebTokenError('invalid'))
        .mockRejectedValueOnce(new JsonWebTokenError('invalid'));

      // When & Then
      await expect(service.verify('bad-token')).rejects.toThrow(
        JwtInvalidTokenException,
      );
    });
  });

  describe('decode', () => {
    it('토큰을 디코딩한다', async () => {
      // Given
      const payload = { sub: 'user-uuid' };
      nestJwtService.decode.mockReturnValue(payload);

      // When
      const result = await service.decode('some-token');

      // Then
      expect(result).toEqual(payload);
    });

    it('디코딩 실패 시 JwtInvalidTokenException을 던진다', async () => {
      // Given
      nestJwtService.decode.mockImplementation(() => {
        throw new Error('decode error');
      });

      // When & Then
      await expect(service.decode('bad-token')).rejects.toThrow(
        JwtInvalidTokenException,
      );
    });
  });
});

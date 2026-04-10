import { Test, TestingModule } from '@nestjs/testing';
import { TokenCookieService } from './token-cookie.service';
import JwtConfig from '../config/jwtConfig';
import appConfig from '../config/appConfig';

describe('TokenCookieService', () => {
  const createService = async (isDevelopment: boolean) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCookieService,
        {
          provide: JwtConfig.KEY,
          useValue: { jwtAccessTokenExpiresIn: 3600, jwtRefreshTokenExpiresIn: 86400 },
        },
        {
          provide: appConfig.KEY,
          useValue: { isDevelopment },
        },
      ],
    }).compile();

    return module.get(TokenCookieService);
  };

  describe('setAuthCookies', () => {
    it('프로덕션 환경에서 secure 쿠키를 설정한다', async () => {
      // Given
      const service = await createService(false);
      const res = { cookie: jest.fn() } as never;

      // When
      service.setAuthCookies(res, { accessToken: 'at', refreshToken: 'rt' });

      // Then
      expect((res as { cookie: jest.Mock }).cookie).toHaveBeenCalledWith(
        'access_token', 'at',
        expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'strict' }),
      );
      expect((res as { cookie: jest.Mock }).cookie).toHaveBeenCalledWith(
        'refresh_token', 'rt',
        expect.objectContaining({ httpOnly: true, secure: true }),
      );
    });

    it('개발 환경에서 lax 쿠키를 설정한다', async () => {
      // Given
      const service = await createService(true);
      const res = { cookie: jest.fn() } as never;

      // When
      service.setAuthCookies(res, { accessToken: 'at', refreshToken: 'rt' });

      // Then
      expect((res as { cookie: jest.Mock }).cookie).toHaveBeenCalledWith(
        'access_token', 'at',
        expect.objectContaining({ httpOnly: false, secure: false, sameSite: 'lax' }),
      );
    });
  });

  describe('clearAuthCookies', () => {
    it('access_token과 refresh_token 쿠키를 삭제한다', async () => {
      // Given
      const service = await createService(false);
      const res = { clearCookie: jest.fn() } as never;

      // When
      service.clearAuthCookies(res);

      // Then
      expect((res as { clearCookie: jest.Mock }).clearCookie).toHaveBeenCalledWith('access_token');
      expect((res as { clearCookie: jest.Mock }).clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
});

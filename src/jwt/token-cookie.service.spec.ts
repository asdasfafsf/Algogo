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
        { provide: appConfig.KEY, useValue: { isDevelopment } },
      ],
    }).compile();
    return module.get(TokenCookieService);
  };

  describe('setAuthCookies', () => {
    it('프로덕션: httpOnly=true, secure=true, sameSite=strict', async () => {
      // Given
      const service = await createService(false);
      const cookie = jest.fn();
      const res = { cookie } as never;

      // When
      service.setAuthCookies(res, { accessToken: 'at', refreshToken: 'rt' });

      // Then
      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenCalledWith('access_token', 'at', {
        httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000,
      });
      expect(cookie).toHaveBeenCalledWith('refresh_token', 'rt', {
        httpOnly: true, secure: true, sameSite: 'strict', maxAge: 86400000,
      });
    });

    it('개발: httpOnly=false, secure=false, sameSite=lax', async () => {
      // Given
      const service = await createService(true);
      const cookie = jest.fn();
      const res = { cookie } as never;

      // When
      service.setAuthCookies(res, { accessToken: 'at', refreshToken: 'rt' });

      // Then
      expect(cookie).toHaveBeenCalledWith('access_token', 'at', {
        httpOnly: false, secure: false, sameSite: 'lax', maxAge: 3600000,
      });
    });

    it('maxAge는 config의 expiresIn * 1000 이다', async () => {
      // Given
      const service = await createService(false);
      const cookie = jest.fn();
      const res = { cookie } as never;

      // When
      service.setAuthCookies(res, { accessToken: 'at', refreshToken: 'rt' });

      // Then
      const accessCall = cookie.mock.calls.find(
        (c: unknown[]) => c[0] === 'access_token',
      );
      const refreshCall = cookie.mock.calls.find(
        (c: unknown[]) => c[0] === 'refresh_token',
      );
      expect(accessCall[2].maxAge).toBe(3600 * 1000);
      expect(refreshCall[2].maxAge).toBe(86400 * 1000);
    });
  });

  describe('clearAuthCookies', () => {
    it('access_token과 refresh_token 쿠키를 삭제한다', async () => {
      // Given
      const service = await createService(false);
      const clearCookie = jest.fn();
      const res = { clearCookie } as never;

      // When
      service.clearAuthCookies(res);

      // Then
      expect(clearCookie).toHaveBeenCalledTimes(2);
      expect(clearCookie).toHaveBeenCalledWith('access_token');
      expect(clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
});

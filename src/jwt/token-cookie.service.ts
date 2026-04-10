import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import JwtConfig from '../config/jwtConfig';
import appConfig from '../config/appConfig';

@Injectable()
export class TokenCookieService {
  private readonly isProduction: boolean;

  constructor(
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>,
  ) {
    this.isProduction = !appCfg.isDevelopment;
  }

  setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: this.isProduction,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: this.jwtConfig.jwtAccessTokenExpiresIn * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: this.isProduction,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: this.jwtConfig.jwtRefreshTokenExpiresIn * 1000,
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}

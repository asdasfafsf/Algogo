import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'express';
import googleOAuthConfig from '../config/googleOAuthConfig';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AppLogger } from '../logger/app-logger';
import { CustomOAuthStrategy } from './custom-oauth.strategy';
import { Strategy } from 'passport-oauth2';
import { OAUTH_PROVIDER } from '../common/constants/oauth.contant';

@Injectable()
export class GoogleOauthStrategy extends CustomOAuthStrategy(
  Strategy,
  OAUTH_PROVIDER.GOOGLE,
) {
  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof googleOAuthConfig>,
    private readonly logger: AppLogger,
    private readonly httpService: HttpService,
  ) {
    super({
      clientID: oauthConfig.clientID ?? '',
      clientSecret: oauthConfig.clientSecret ?? '',
      callbackURL: oauthConfig.callbackURL ?? '',
      authorizationURL: oauthConfig.authorizationURL ?? '',
      tokenURL: oauthConfig.tokenURL ?? '',
      connectCallbackURL: oauthConfig.connectCallbackURL ?? '',
      disconnectCallbackURL: oauthConfig.disconnectCallbackURL ?? '',
      scope: ['profile', 'email'], // Google 전용 scope
    });
  }

  async validate(req: Request & { oauth?: Record<string, unknown>; user?: Record<string, unknown> }, accessToken: string, refreshToken: string) {
    const userInfo = await this.getUserInfo(accessToken);
    const { sub, name, email } = userInfo;

    return super.validate(req, accessToken, refreshToken, {
      provider: OAUTH_PROVIDER.GOOGLE,
      name,
      id: sub,
      email,
      accessToken,
    });
  }

  private async getUserInfo(accessToken: string): Promise<Record<string, unknown>> {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }
}

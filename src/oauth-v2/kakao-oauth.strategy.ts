import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'express';
import { ConfigType } from '@nestjs/config';
import kakaoOAuthConfig from '../config/kakaoOAuthConfig';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AppLogger } from '../logger/app-logger';
import { CustomOAuthStrategy } from './custom-oauth.strategy';
import { Strategy } from 'passport-oauth2';
import { OAUTH_PROVIDER } from '../common/constants/oauth.contant';

@Injectable()
export class KakaoOAuthStrategy extends CustomOAuthStrategy(
  Strategy,
  OAUTH_PROVIDER.KAKAO,
) {
  constructor(
    @Inject(kakaoOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof kakaoOAuthConfig>,
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
      scope: 'openid',
    });
  }

  async validate(
    req: Request & { oauth?: Record<string, unknown>; user?: Record<string, unknown> },
    accessToken: string,
    refreshToken: string,
  ): Promise<Record<string, unknown>> {
    const userInfo = await this.getUserInfo(accessToken);
    const { sub, nickname, email } = userInfo;

    return super.validate(req, accessToken, refreshToken, {
      provider: OAUTH_PROVIDER.KAKAO,
      name: nickname ?? '',
      id: sub,
      email: email ?? '',
      accessToken,
    });
  }

  private async getUserInfo(accessToken: string): Promise<Record<string, unknown>> {
    const url = 'https://kapi.kakao.com/v1/oidc/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );

      return response.data;
    } catch (error: unknown) {
      this.logger.error('Error fetching Kakao user info', { error: String(error) });
      throw error;
    }
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import kakaoOAuthConfig from '../config/kakaoOAuthConfig';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { CustomLogger } from '../logger/custom-logger';
import CustomOAuthStrategy from './custom-oauth.strategy';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class KakaoOAuthStrategy extends CustomOAuthStrategy(
  Strategy,
  OAuthProvider.KAKAO,
) {
  constructor(
    @Inject(kakaoOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof kakaoOAuthConfig>,
    private readonly logger: CustomLogger,
    private readonly httpService: HttpService,
  ) {
    super({
      ...oauthConfig,
      scope: 'openid',
    });
  }

  async validate(accessToken: string): Promise<any> {
    const userInfo = await this.getUserInfo(accessToken);
    const { sub, nickname, email } = userInfo;
    return {
      provider: OAuthProvider.KAKAO,
      name: nickname ?? '',
      id: sub,
      email: email ?? '',
      accessToken,
    };
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    const url = 'https://kapi.kakao.com/v1/oidc/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error fetching Kakao user info', { error });
      throw error;
    }
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigType } from '@nestjs/config';
import kakaoOAuthConfig from '../config/kakaoOAuthConfig';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class KakaoOAuthStrategy extends PassportStrategy(Strategy, 'kakao') {
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
    this.logger.silly('KakaoOauthStrategy initialized', oauthConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    this.logger.silly('KakaoOAuthStrategy validate', {
      accessToken,
      refreshToken,
      profile,
    });

    const userInfo = await this.getUserInfo(accessToken);
    const { sub, nickname, email } = userInfo;
    return {
      provider: OAuthProvider.KAKAO,
      name: nickname,
      id: sub,
      email: email ?? '',
      accessToken,
    };
  }

  async getUserInfo(accessToken: string): Promise<any> {
    this.logger.silly('Getting user info with access token', {});

    const url = 'https://kapi.kakao.com/v1/oidc/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );

      this.logger.silly('kakao getUserInfo', {
        data: response.data,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching user info', { error });
      throw error;
    }
  }
}

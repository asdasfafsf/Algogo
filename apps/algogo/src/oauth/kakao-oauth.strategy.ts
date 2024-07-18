import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import kakaoOAuthConfig from '../config/kakaoOAuthConfig';

@Injectable()
export class KakaoOAuthStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    @Inject(kakaoOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof kakaoOAuthConfig>,
    @Inject('winston')
    private readonly logger: Logger,
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
    return {
      accessToken,
      refreshToken,
      profile,
    };
  }
}

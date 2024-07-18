import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import googleOAuthConfig from '../config/googleOAuthConfig';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof googleOAuthConfig>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {
    super({
      ...oauthConfig,
      scope: ['profile', 'email'],
    });
    this.logger.silly('GoogleOauthStrategy initialized', oauthConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    this.logger.silly('GoogleOAuthStrategy validate', {
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

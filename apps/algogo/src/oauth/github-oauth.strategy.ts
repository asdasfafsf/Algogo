import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import githubOAuthConfig from '../config/githubOAuthConfig';

@Injectable()
export class GithubOAuthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(githubOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof githubOAuthConfig>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {
    super({
      ...oauthConfig,
      scope: 'openid',
    });
    this.logger.silly('GithubOauthStrategy initialized', oauthConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    this.logger.silly('GithubOauthStrategy validate', {
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

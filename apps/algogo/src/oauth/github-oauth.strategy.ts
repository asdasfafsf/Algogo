import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import githubOAuthConfig from '../config/githubOAuthConfig';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GithubOAuthStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject(githubOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof githubOAuthConfig>,
    @Inject('winston')
    private readonly logger: Logger,
    private readonly httpService: HttpService,
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

    const userInfo = await this.getUserInfo(accessToken);
    const { id, name, email } = userInfo;

    return {
      provider: 'github',
      name,
      id: id.toString(),
      email,
      accessToken,
    };
  }

  async getUserInfo(accessToken: string): Promise<any> {
    this.logger.silly('Getting user info with access token', {});

    const url = 'https://api.github.com/user';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );

      this.logger.silly('github getUserInfo', {
        data: response.data,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching user info', { error });
      throw error;
    }
  }
}

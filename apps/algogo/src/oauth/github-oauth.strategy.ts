import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import githubOAuthConfig from '../config/githubOAuthConfig';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import CustomOAuthStrategy from './custom-oauth.strategy';
import { Strategy } from 'passport-oauth2';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class GithubOAuthStrategy extends CustomOAuthStrategy(
  Strategy,
  OAuthProvider.GITHUB,
) {
  constructor(
    @Inject(githubOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof githubOAuthConfig>,
    private readonly logger: CustomLogger,
    private readonly httpService: HttpService,
  ) {
    super({
      ...oauthConfig,
      scope: 'openid',
    });
    this.logger.silly('GithubOAuthStrategy initialized', oauthConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    this.logger.silly('GithubOAuthStrategy validate', {
      accessToken,
      refreshToken,
      profile,
    });

    const userInfo = await this.getUserInfo(accessToken);
    const { id, name, email } = userInfo;

    return {
      provider: OAuthProvider.GITHUB,
      name,
      id: id.toString(),
      email,
      accessToken,
    };
  }

  private async getUserInfo(accessToken: string): Promise<any> {
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

      this.logger.silly('Github getUserInfo', {
        data: response.data,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching user info', { error });
      throw error;
    }
  }
}

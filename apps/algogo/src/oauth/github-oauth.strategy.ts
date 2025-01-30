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
  }

  async validate(accessToken: string): Promise<any> {
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
    const url = 'https://api.github.com/user';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error fetching user info', { error });
      throw error;
    }
  }
}

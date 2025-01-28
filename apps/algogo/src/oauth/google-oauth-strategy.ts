import { Injectable, Inject } from '@nestjs/common';
import googleOAuthConfig from '../config/googleOAuthConfig';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RequestOAuthDto } from './dto/RequestOAuthDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { CustomLogger } from '../logger/custom-logger';
import CustomOAuthStrategy from './custom-oauth.strategy';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class GoogleOauthStrategy extends CustomOAuthStrategy(
  Strategy,
  OAuthProvider.GOOGLE,
) {
  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof googleOAuthConfig>,
    private readonly logger: CustomLogger,
    private readonly httpService: HttpService,
  ) {
    super({
      ...oauthConfig,
      scope: ['profile', 'email'], // Google 전용 scope
    });
    this.logger.silly('GoogleOauthStrategy initialized', oauthConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<RequestOAuthDto> {
    this.logger.silly('GoogleOAuthStrategy validate', {
      accessToken,
      refreshToken,
      profile,
    });

    const userInfo = await this.getUserInfo(accessToken);
    const { sub, name, email } = userInfo;
    return {
      provider: OAuthProvider.GOOGLE,
      name,
      id: sub,
      email,
      accessToken,
    };
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    this.logger.silly('Fetching Google user info', { accessToken });

    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );
      this.logger.silly('Google user info fetched', { data: response.data });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching Google user info', { error });
      throw error;
    }
  }
}

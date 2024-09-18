import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import googleOAuthConfig from '../config/googleOAuthConfig';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly oauthConfig: ConfigType<typeof googleOAuthConfig>,
    private readonly logger: CustomLogger,
    private readonly httpService: HttpService,
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

  async getUserInfo(accessToken: string): Promise<any> {
    this.logger.silly('Getting user info with access token', { accessToken });

    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
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

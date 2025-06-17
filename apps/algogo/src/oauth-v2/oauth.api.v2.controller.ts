import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { OAuthRequest } from './types/oauth.type';
import { OauthV2Service } from './oauth-v2.service';

@Controller('api/v2/oauth')
export class OauthApiV2Controller {
  constructor(private readonly oauthV2Service: OauthV2Service) {}

  @Get('/:provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth(@Req() req: OAuthRequest) {
    const { user } = req;
    const { accessToken, refreshToken } =
      await this.oauthV2Service.registerOrLogin(user);

    return {
      accessToken,
      refreshToken,
    };
  }
}

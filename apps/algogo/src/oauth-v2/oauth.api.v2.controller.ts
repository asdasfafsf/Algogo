import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { OAuthRequest } from './types/oauth.type';
import { OauthV2Service } from './oauth-v2.service';
import { AuthV2Guard } from '../auth-v2/auth-v2.guard';

@Controller('api/v2/oauth')
export class OauthApiV2Controller {
  constructor(private readonly oauthV2Service: OauthV2Service) {}

  @Get('/:provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth(@Req() req: OAuthRequest) {
    const { oauth } = req;
    const { accessToken, refreshToken } =
      await this.oauthV2Service.registerOrLogin(oauth);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('/connect/:provider')
  @UseGuards(AuthV2Guard, DynamicOAuthGuard)
  async connectOAuth(@Req() req: OAuthRequest) {
    const { user, oauth } = req;
    const { provider } = req.params;
    await this.oauthV2Service.connectOAuthProvider({
      id: oauth.id,
      provider,
      userUuid: user.sub,
    });
  }
}

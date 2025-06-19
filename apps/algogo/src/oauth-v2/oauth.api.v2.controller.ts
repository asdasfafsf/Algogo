import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { OAuthProvider, OAuthRequestUser } from '../common/types/oauth.type';
import { OauthV2Service } from './oauth-v2.service';
import { AuthGuard } from '../auth-guard/auth.guard';
import { TokenUser } from '../common/types/request.type';
import { User } from '../common/decorators/contexts/user.decorator';
import { OAuth } from '../common/decorators/contexts/oauth.decorator';

@Controller('api/v2/oauth')
export class OauthApiV2Controller {
  constructor(private readonly oauthV2Service: OauthV2Service) {}

  @Post('/:provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth(@OAuth() oauth: OAuthRequestUser) {
    const { accessToken, refreshToken } =
      await this.oauthV2Service.registerOrLogin(oauth);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('/connect/:provider')
  @UseGuards(AuthGuard, DynamicOAuthGuard)
  async connectOAuth(
    @User() user: TokenUser,
    @OAuth() oauth: OAuthRequestUser,
    @Param('provider') provider: OAuthProvider,
  ) {
    await this.oauthV2Service.connectOAuthProvider({
      id: oauth.id,
      provider,
      userUuid: user.sub,
    });
  }

  @Post('/disconnect/:provider')
  @UseGuards(AuthGuard, DynamicOAuthGuard)
  async disconnectOAuth(
    @User() user: TokenUser,
    @OAuth() oauth: OAuthRequestUser,
    @Param('provider') provider: OAuthProvider,
  ) {
    await this.oauthV2Service.disconnectOAuthProvider({
      id: oauth.id,
      provider,
      userUuid: user.sub,
    });
  }
}

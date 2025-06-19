import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { OAuthProvider, OAuthRequestUser } from '../common/types/oauth.type';
import { OauthV2Service } from './oauth-v2.service';
import { AuthGuard } from '../auth-guard/auth.guard';
import { TokenUser } from '../common/types/request.type';
import { User } from '../common/decorators/contexts/user.decorator';
import { OAuth } from '../common/decorators/contexts/oauth.decorator';
import { RequestMetadata } from '../common/decorators/contexts/request-metadata.decorator';
import { RequestMetadata as Metadata } from '../common/types/request.type';

@Controller('api/v2/oauth')
export class OauthApiV2Controller {
  constructor(private readonly oauthV2Service: OauthV2Service) {}

  @Post('/:provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth(@OAuth() oauth: OAuthRequestUser, @RequestMetadata() metadata: Metadata) {
    const { accessToken, refreshToken } =
      await this.oauthV2Service.registerOrLogin({
        ...oauth,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      });

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

import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { OAuthExceptionFilter } from './oauth-exception.filter';

@Controller('oauth/v2')
@UseFilters(OAuthExceptionFilter)
export class OauthV2Controller {
  @Get('/:provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth() {}

  @Get('/connect/:provider')
  @UseGuards(DynamicOAuthGuard)
  async connectOAuth() {}

  @Get('/disconnect/:provider')
  @UseGuards(DynamicOAuthGuard)
  async disconnectOAuth() {}
}

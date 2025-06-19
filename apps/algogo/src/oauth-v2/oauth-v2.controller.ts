import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';

@Controller('oauth/v2')
export class OauthV2Controller {
  @Get('/:provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth() {}


  @Post('/connect/:provider')
  @UseGuards(DynamicOAuthGuard)
  async connectOAuth() {}


}

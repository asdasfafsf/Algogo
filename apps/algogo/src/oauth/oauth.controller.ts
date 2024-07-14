import { Controller, Get, Param, Query } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RequestOAuthCallbackDto } from '@libs/core/dto/RequestOAuthCallbackDto';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
  ) {
    console.log(`code: ${requestOAuthCallbackDto.code}`);
    console.log(`provider: ${provider}`);
    console.log(`scope: ${requestOAuthCallbackDto.scope}`);
    console.log(`authuser: ${requestOAuthCallbackDto.authuser}`);
    console.log(`prompt: ${requestOAuthCallbackDto.prompt}`);
  }
}

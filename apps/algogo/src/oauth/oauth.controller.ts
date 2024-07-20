import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RequestOAuthCallbackDto } from '@libs/core/dto/RequestOAuthCallbackDto';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';

@Controller('oauth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  @Get(':provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth(
    @Param('provider') provider: string,
    @Query() requestOAuthCallbackDto: any,
  ) {
    this.logger.silly('OAuth callback reached', {
      provider,
      requestOAuthCallbackDto,
    });
  }

  @Get(':provider/callback')
  @UseGuards(DynamicOAuthGuard)
  async callback(
    @Param('provider') provider: string,
    @Query() requestOAuthCallbackDto: any,
    @Req() req: any,
  ) {
    this.logger.silly(`${provider}/callback`, req.user);
    const requestOAuthDto = req.user as RequestOAuthDto;
    const userInfo = await this.oauthService.registerOrLogin(requestOAuthDto);
  }
}

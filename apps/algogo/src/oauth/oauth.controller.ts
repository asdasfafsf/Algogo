import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RequestOAuthCallbackDto } from '@libs/core/dto/RequestOAuthCallbackDto';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';

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
    this.logger.info('OAuth callback reached', {
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
    this.logger.info('OAuth callback reached', {
      provider,
      requestOAuthCallbackDto,
    });
    console.log('알리바바');
    console.log(requestOAuthCallbackDto);
    console.log(req.user); // 여기서 req.user를 확인하여 인증이 성공적으로 이루어졌는지 확인
  }
}

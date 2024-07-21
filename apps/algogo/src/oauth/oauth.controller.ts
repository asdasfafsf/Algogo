import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RequestOAuthCallbackDto } from '@libs/core/dto/RequestOAuthCallbackDto';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import { Request, Response } from 'express';

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
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
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
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.logger.silly(`${provider}/callback`, req.user);
    const ip = req.clientIp ?? 'error';
    this.logger.silly(`${provider}/callback ip`, {
      ip
    });
    const requestOAuthDto = {... req.user as RequestOAuthDto, ip};
    const user = await this.oauthService.registerOrLogin(requestOAuthDto);
  }
}

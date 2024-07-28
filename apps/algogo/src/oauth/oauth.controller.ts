import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RequestOAuthCallbackDto } from '@libs/core/dto/RequestOAuthCallbackDto';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import { Request, Response } from 'express';
import { OAuthExceptionFilter } from './oauth-exception.filter';

@Controller('v1/oauth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  @Get(':provider')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
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
  @UseFilters(OAuthExceptionFilter)
  async callback(
    @Param('provider') provider: string,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = req.clientIp ?? 'error';
    this.logger.silly(`${provider}/callback ip`, {
      ip,
    });
    const requestOAuthDto = { ...(req.user as RequestOAuthDto), ip };
    const uuid = await this.oauthService.login(requestOAuthDto);
    res.cookie('token', uuid, {
      httpOnly: process.env.NODE_ENV === 'development' ? undefined : true,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : undefined,
    });
    res.redirect(
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173/oauth/token/'
        : '/oauth/token',
    );
  }
}

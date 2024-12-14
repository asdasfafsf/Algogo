import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RequestOAuthCallbackDto } from '@libs/core/dto/RequestOAuthCallbackDto';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { RequestOAuthDto } from '@libs/core/dto/RequestOAuthDto';
import { Request, Response } from 'express';
import { OAuthExceptionFilter } from './oauth-exception.filter';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../logger/custom-logger';

@ApiTags('OAuth API')
@Controller('v1/oauth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    private readonly logger: CustomLogger,
  ) {}

  @ApiOperation({
    summary: 'OAuth Page로 이동',
    description: 'OAuth Page로 이동함',
  })
  @ApiParam({
    name: 'provider',
    enum: OAuthProvider,
    description: '인증 기관',
  })
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: ':provider/callback 으로 redirect함',
  })
  @Get(':provider')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async oauth(
    @Param('provider') provider: OAuthProvider,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
  ) {
    this.logger.silly('OAuth callback reached', {
      provider,
      requestOAuthCallbackDto,
    });
  }

  @ApiOperation({
    summary: 'OAuth callback',
    description: 'OAuth 토큰 발급 페이지로 redirect 해줌',
  })
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description:
      '/oauth/token 으로 이동. 프론트는 여기서 토큰 발급 API로 요청을 보내면 토큰이 발급됨',
  })
  @Get(':provider/callback')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async callback(
    @Param('provider') provider: OAuthProvider,
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
        : 'https://www.algogo.co.kr/oauth/token',
    );
  }

  @ApiOperation({
    summary: 'OAuth Page로 이동',
    description: 'OAuth Page로 이동함',
  })
  @ApiParam({
    name: 'provider',
    enum: OAuthProvider,
    description: '인증 기관',
  })
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: ':provider/add/callback 으로 redirect함',
  })
  @Get(':provider/add')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async add(
    @Param('provider') provider: OAuthProvider,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
  ) {
    this.logger.silly('OAuth add reached', {
      provider,
      requestOAuthCallbackDto,
    });
  }

  @Get(':provider/add/callback')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async addCallback(
    @Param('provider') provider: OAuthProvider,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
  ) {
    this.logger.silly('provider', provider);
    this.logger.silly('dto', requestOAuthCallbackDto);
    this.oauthService.addOAuthProvider();
  }
}

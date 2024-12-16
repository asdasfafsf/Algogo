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
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { Request, Response } from 'express';
import { OAuthExceptionFilter } from './oauth-exception.filter';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomLogger } from '../logger/custom-logger';
import { RequestOAuthCallbackDto } from './dto/RequestOAuthCallbackDto';
import { RequestOAuthDto } from './dto/RequestOAuthDto';
import { AuthGuard } from '../auth/auth.guard';

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

  @Get(':provider/connect')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async add(
    @Param('provider') provider: OAuthProvider,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
  ) {
    this.logger.silly('정말 여기 아무것도 안와?');
    this.logger.silly('OAuth add reached', {
      provider,
      requestOAuthCallbackDto,
    });
  }

  @Get(':provider/connect/callback')
  @UseGuards(AuthGuard, DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async addCallback(
    @Param('provider') provider: OAuthProvider,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const requestOAuthDto = { ...(req.user as RequestOAuthDto) };
    console.log(req.user);
    this.logger.silly('provider', requestOAuthDto);
    this.logger.silly('dto', requestOAuthCallbackDto);
    this.oauthService.connectOAuthProvider(requestOAuthDto);
  }

  @ApiOperation({
    summary: '임시 인증 쿠키 발급',
    description: 'OAuth 인증 페이지 접근을 위해 임시 인증 쿠키를 발급합니다.',
  })
  @ApiBearerAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: '쿠키 발급 성공',
    schema: {
      example: true,
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @Get('/cookie')
  @UseGuards(AuthGuard)
  async getCoookie(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.headers['authorization'];
    res.cookie('authorization', token, {
      httpOnly: process.env.NODE_ENV === 'development' ? undefined : true,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : undefined,
      maxAge: 60 * 1000,
    });
    return true;
  }
}

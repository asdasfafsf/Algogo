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
  ConflictException,
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
import { AllExceptionsFilter } from '@libs/filter/src';
import { OAuthState } from './constants/OAuthState';

@ApiTags('OAuth API')
@Controller('v1/oauth')
export class OauthController {
  constructor(
    private readonly oauthService: OauthService,
    private readonly logger: CustomLogger,
  ) {}

  @ApiOperation({
    summary: '임시 인증 쿠키 발급',
    description: 'OAuth 인증 페이지 접근을 위해 임시 인증 쿠키를 발급합니다.',
  })
  @ApiBearerAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: '쿠키 발급 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @Get('/cookie')
  @UseGuards(AuthGuard)
  @UseFilters(AllExceptionsFilter)
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
    return;
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
    description: ':provider/callback 으로 redirect함',
  })
  @Get(':provider')
  @UseGuards(DynamicOAuthGuard)
  async oauth() {}

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
    const requestOAuthDto = { ...(req.user as RequestOAuthDto), ip };
    const uuid = await this.oauthService.login(requestOAuthDto);

    const state = requestOAuthCallbackDto?.state;
    const destination = state?.destination ?? '/';

    return res
      .cookie('token', uuid, {
        httpOnly: process.env.NODE_ENV === 'development' ? undefined : true,
        secure: process.env.NODE_ENV === 'development' ? false : true,
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : undefined,
      })
      .redirect(
        process.env.NODE_ENV === 'development'
          ? `http://localhost:5173/oauth/token?destination=${destination}`
          : `https://www.algogo.co.kr/oauth/token?destination=${destination}`,
      );
  }

  @Get(':provider/connect')
  @UseGuards(DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async add() {}

  @Get(':provider/connect/callback')
  @UseGuards(AuthGuard, DynamicOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async addCallback(
    @Param('provider') provider: OAuthProvider,
    @Query() requestOAuthCallbackDto: RequestOAuthCallbackDto,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const userNo = req.userNo;
    const requestOAuthDto = {
      ...(req.user as RequestOAuthDto),
      userNo,
      provider,
    };

    const oauthState =
      await this.oauthService.getOAuthStateWithLogined(requestOAuthDto);

    if (
      oauthState === OAuthState.NEW ||
      oauthState === OAuthState.CONNECTED_AND_INACTIVE
    ) {
      await this.oauthService.connectOAuthProvider(requestOAuthDto);

      res.redirect(
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5173/me'
          : 'https://www.algogo.co.kr/me',
      );
    } else if (oauthState === OAuthState.CONNECTED_AND_ACTIVE) {
      throw new ConflictException('이미 연동되어 있는 계정입니다.');
    } else if (oauthState === OAuthState.CONNECTED_TO_OTHER_ACCOUNT) {
      throw new ConflictException(
        '이미 다른 계정에 연동되어 있습니다. 연동 해제 후 진행해주세요.',
      );
    } else if (oauthState === OAuthState.DISCONNECTED_FROM_OTHER_ACCOUNT) {
      // 다른 사람이 해지한 계정
      throw new ConflictException(
        '이미 다른 계정에 연동되어 있습니다. 연동 해제 후 진행해주세요.',
      );
    }
  }
}

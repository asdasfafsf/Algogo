import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Res,
  UseFilters,
  HttpStatus,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AllExceptionsFilter } from '@libs/filter/src';
import { CustomLogger } from '../logger/custom-logger';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';

@ApiTags('OAuth API')
@Controller('api/v1/oauth')
@UseGuards(AuthGuard)
@UseFilters(AllExceptionsFilter)
export class OAuthApiController {
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
    summary: 'OAuth 연동 해제',
    description: '특정 OAuth 제공자와의 계정 연동을 해제합니다.',
  })
  @ApiParam({
    name: 'provider',
    description: 'OAuth 제공자 (예: google, facebook)',
    example: 'google',
  })
  @ApiResponse({ status: HttpStatus.OK, description: '연동 해제 성공' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '연동된 계정이 아닐 경우',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '서버 내부 오류',
  })
  @Delete('/:provider')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @Req() req: AuthRequest,
    @Param('provider') provider: OAuthProvider,
  ) {
    const { userUuid } = req;
    await this.oauthService.disconnectOAuth({
      userUuid,
      provider,
    });
    return null;
  }
}

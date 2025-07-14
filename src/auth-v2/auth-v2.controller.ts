import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthV2Service } from './auth-v2.service';
import { RefreshTokenRequest } from '../common/types/request.type';
import { AuthRefreshGuard } from '../auth-guard/auth-refresh.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { RequestMetadata as Metadata } from '../common/types/request.type';
import { RequestMetadata } from '../common/decorators/contexts/request-metadata.decorator';
import { Response } from 'express';
import { Inject } from '@nestjs/common';
import JwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';

@ApiTags('Auth V2')
@ApiBearerAuth('Authorization')
@ApiGlobalErrorResponses()
@Controller('api/v2/auth')
export class AuthV2Controller {
  constructor(
    private readonly authV2Service: AuthV2Service,
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
  ) {}

  @ApiOperation({
    summary: '토큰 재발급',
    description:
      'Refresh 토큰을 이용해 새로운 Access/Refresh 토큰을 발급합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '재발급 성공',
    schema: {
      example: {
        statusCode: 200,
        errorCode: '0000',
        errorMessage: '',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @HttpCode(200)
  @UseGuards(AuthRefreshGuard)
  @Post('/refresh')
  async refresh(
    @Req() req: RefreshTokenRequest,
    @Res({ passthrough: true }) res: Response,
    @RequestMetadata() metadata: Metadata,
  ) {
    const { user } = req;
    const { accessToken, refreshToken } = await this.authV2Service.refresh({
      userUuid: user.sub,
      refreshToken: user.refreshToken,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: process.env.NODE_ENV !== 'development', // 개발환경에서는 접근 허용
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV !== 'development' ? 'strict' : 'lax', // 개발환경에서는 lax
      maxAge: this.jwtConfig.jwtAccessTokenExpiresIn * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: process.env.NODE_ENV !== 'development', // 개발환경에서는 접근 허용
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV !== 'development' ? 'strict' : 'lax', // 개발환경에서는 lax
      maxAge: this.jwtConfig.jwtRefreshTokenExpiresIn * 1000,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

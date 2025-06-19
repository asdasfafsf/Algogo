import { Controller, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
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

@ApiTags('Auth V2')
@ApiBearerAuth('Authorization')
@ApiGlobalErrorResponses()
@Controller('api/v2/auth')
export class AuthV2Controller {
  constructor(private readonly authV2Service: AuthV2Service) {}

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
  async refresh(@Req() req: RefreshTokenRequest) {
    const { user } = req;
    const { accessToken, refreshToken } = await this.authV2Service.refresh({
      userUuid: user.sub,
      refreshToken: user.refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

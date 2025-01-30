import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import ResponseTokenDto from './dto/ResponseTokenDto';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import { CustomLogger } from '../logger/custom-logger';

@ApiTags('인증 관련 API')
@ApiBadRequestErrorResponse()
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly logger: CustomLogger,
    private readonly authService: AuthService,
  ) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: '토큰 발급  성공',
    type: ResponseTokenDto,
  })
  @ApiOperation({
    summary: 'OAuth 이후 로그인 토큰 발급받는 API',
    description: 'OAuth 완료 이후 이 URL로 요청을 보내 토큰을 발급받는다.',
  })
  @ApiCookieAuth('token')
  @Get('/token')
  async token(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req?.cookies?.token;

    if (!token) {
      throw new BadRequestException('토큰이 없습니다.');
    }
    const tokens = await this.authService.getLoginToken(token);
    res.clearCookie('token');

    return tokens;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: '토큰 발급  성공',
    type: ResponseTokenDto,
  })
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() requestRefreshDto: { refreshToken: string }) {
    const tokens = await this.authService.refreshToken(
      requestRefreshDto.refreshToken,
    );

    return tokens;
  }
}

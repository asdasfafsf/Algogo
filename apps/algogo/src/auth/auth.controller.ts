import {
  BadRequestException,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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

  @Get('/test')
  @UseGuards(AuthGuard)
  async test() {
    return 'OK';
  }
}

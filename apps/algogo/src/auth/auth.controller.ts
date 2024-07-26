import { BadRequestException, Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('/token')
  async token(@Req() req: Request, @Res() res: Response) {
    const token = req?.cookies?.token;

    if (!token) {
      throw new BadRequestException('토큰이 없습니다.');
    }
    const tokens = await this.authService.getLoginToken(token);
    res.clearCookie('token');

    return tokens;
  }

  @Get('/test')
  async test() {
    return await this.authService.test();
  }
}

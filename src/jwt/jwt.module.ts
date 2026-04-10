import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { TokenCookieService } from './token-cookie.service';

@Module({
  imports: [NestJwtModule.register({})],
  providers: [JwtService, TokenCookieService],
  exports: [JwtService, TokenCookieService],
})
export class JwtModule {}

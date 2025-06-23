import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '../jwt/jwt.module';
import { WsAuthGuard } from './ws.auth.guard';
import { AuthRefreshGuard } from './auth-refresh.guard';
import { DecodeGuard } from './decode-guard';

@Module({
  imports: [JwtModule],
  providers: [AuthGuard, WsAuthGuard, AuthRefreshGuard, DecodeGuard],
  exports: [AuthGuard, WsAuthGuard, AuthRefreshGuard, JwtModule, DecodeGuard],
})
export class AuthGuardModule {}

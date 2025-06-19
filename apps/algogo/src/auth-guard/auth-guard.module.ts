import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '../jwt/jwt.module';
import { WsAuthGuard } from './ws.auth.guard';
import { AuthRefreshGuard } from './auth-refresh.guard';

@Module({
  imports: [JwtModule],
  providers: [AuthGuard,WsAuthGuard, AuthRefreshGuard],
  exports: [AuthGuard, WsAuthGuard, AuthRefreshGuard, JwtModule],
})
export class AuthGuardModule {}

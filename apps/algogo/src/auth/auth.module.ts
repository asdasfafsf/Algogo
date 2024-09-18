import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '../jwt/jwt.module';
import { CryptoModule } from '../crypto/crypto.module';
import { AuthGuard } from './auth.guard';
import { WsAuthGuard } from './ws.auth.guard';

@Module({
  imports: [RedisModule, JwtModule, CryptoModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, WsAuthGuard],
  exports: [
    AuthService,
    AuthGuard,
    WsAuthGuard,
    RedisModule,
    JwtModule,
    CryptoModule,
  ],
})
export class AuthModule {}

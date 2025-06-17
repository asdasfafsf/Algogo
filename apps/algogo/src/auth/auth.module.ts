import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '../jwt/jwt.module';
import { CryptoModule } from '../crypto/crypto.module';
import { AuthGuard } from './auth.guard';
import { WsAuthGuard } from './ws.auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [RedisModule, JwtModule, CryptoModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, WsAuthGuard, AuthRepository],
  exports: [AuthService, AuthGuard, WsAuthGuard, RedisModule, CryptoModule],
})
export class AuthModule {}

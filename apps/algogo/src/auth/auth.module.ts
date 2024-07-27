import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '../jwt/jwt.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
  imports: [RedisModule, JwtModule, CryptoModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

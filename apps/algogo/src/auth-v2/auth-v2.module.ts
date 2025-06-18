import { Module } from '@nestjs/common';
import { AuthV2Service } from './auth-v2.service';
import { AuthV2Guard } from './auth-v2.guard';
import { JwtModule } from '../jwt/jwt.module';
import { AuthV2Controller } from './auth-v2.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [JwtModule, UsersModule],
  providers: [AuthV2Service, AuthV2Guard],
  exports: [AuthV2Service, AuthV2Guard, JwtModule],
  controllers: [AuthV2Controller],
})
export class AuthV2Module {}

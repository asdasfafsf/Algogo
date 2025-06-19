import { Module } from '@nestjs/common';
import { AuthV2Service } from './auth-v2.service';

import { JwtModule } from '../jwt/jwt.module';
import { AuthV2Controller } from './auth-v2.controller';
import { UsersModule } from '../users/users.module';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  imports: [JwtModule, UsersModule, AuthGuardModule],
  providers: [AuthV2Service],
  exports: [AuthV2Service, JwtModule],
  controllers: [AuthV2Controller],
})
export class AuthV2Module {}

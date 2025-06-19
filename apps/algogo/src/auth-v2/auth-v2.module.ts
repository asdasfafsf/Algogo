import { Module } from '@nestjs/common';
import { AuthV2Service } from './auth-v2.service';
import { AuthV2Guard } from './auth-v2.guard';
import { JwtModule } from '../jwt/jwt.module';
import { AuthV2Controller } from './auth-v2.controller';
import { UsersModule } from '../users/users.module';
import { WsAuthV2Guard } from './ws.auth-v2.guard';

@Module({
  imports: [JwtModule, UsersModule],
  providers: [AuthV2Service, AuthV2Guard, WsAuthV2Guard],
  exports: [AuthV2Service, AuthV2Guard, JwtModule, WsAuthV2Guard],
  controllers: [AuthV2Controller],
})
export class AuthV2Module {}

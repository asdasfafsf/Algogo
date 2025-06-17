import { Module } from '@nestjs/common';
import { AuthV2Service } from './auth-v2.service';
import { AuthV2Guard } from './auth-v2.guard';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [JwtModule],
  providers: [AuthV2Service, AuthV2Guard],
  exports: [AuthV2Service, AuthV2Guard, JwtModule],
})
export class AuthV2Module {}

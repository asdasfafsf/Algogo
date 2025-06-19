import { Module } from '@nestjs/common';

import { KakaoOAuthStrategy } from './kakao-oauth.strategy';
import { GoogleOauthStrategy } from './google-oauth.strategy';
import { AuthV2Module } from '../auth-v2/auth-v2.module';
import { HttpModule } from '@nestjs/axios';
import { OAuthGuardFactory } from './oauth-guard.factory';
import { DynamicOAuthGuard } from './dynamic-oauth.guard';
import { OauthV2Controller } from './oauth-v2.controller';
import { OauthApiV2Controller } from './oauth.api.v2.controller';
import { OauthV2Service } from './oauth-v2.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OauthV2Repository } from './oauth-v2.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({
      session: false,
      property: 'oauth',
      assignProperty: 'oauth',
    }),
    AuthV2Module,
    HttpModule,
    UsersModule,
    AuthV2Module,
    PrismaModule,
  ],
  providers: [
    KakaoOAuthStrategy,
    GoogleOauthStrategy,
    OAuthGuardFactory,
    DynamicOAuthGuard,
    OauthV2Service,
    OauthV2Repository,
  ],
  exports: [],
  controllers: [OauthV2Controller, OauthApiV2Controller],
})
export class OauthV2Module {}

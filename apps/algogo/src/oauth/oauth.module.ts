import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { GoogleOauthStrategy } from './google-oauth-strategy';
import { PassportModule } from '@nestjs/passport';
import { KakaoOAuthStrategy } from './kakao-oauth.strategy';
import { GithubOAuthStrategy } from './github-oauth.strategy';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OauthRepository } from './oauth.repository';
import OAuthFactory from './oauth-guard.factory';

@Module({
  imports: [PassportModule.register({}), HttpModule, PrismaModule, AuthModule],
  controllers: [OauthController],
  providers: [
    OauthService,
    OauthRepository,
    GoogleOauthStrategy,
    GithubOAuthStrategy,
    KakaoOAuthStrategy,
    OAuthFactory,
  ],
})
export class OauthModule {}

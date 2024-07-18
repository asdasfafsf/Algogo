import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { GoogleOauthStrategy } from './google-oauth-strategy';
import { PassportModule } from '@nestjs/passport';
import { KakaoOAuthStrategy } from './kakao-oauth.strategy';
import { GithubOAuthStrategy } from './github-oauth.strategy';

@Module({
  imports: [PassportModule.register({})],
  controllers: [OauthController],
  providers: [
    OauthService,
    GoogleOauthStrategy,
    KakaoOAuthStrategy,
    GithubOAuthStrategy,
  ],
})
export class OauthModule {}

import { registerAs } from '@nestjs/config';

export default registerAs('kakaoOAuth', () => ({
  clientID: process.env.KAKAO_OAUTH_CLIENT_ID,
  clientSecret: process.env.KAKAO_OAUTH_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_OAUTH_CALLBACK_URL,
  authorizationURL: process.env.KAKAO_OAUTH_AUTHORIZATION_URL,
  tokenURL: process.env.KAKAO_OAUTH_TOKEN_URL,
}));

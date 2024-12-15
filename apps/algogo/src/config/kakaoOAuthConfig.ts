import { registerAs } from '@nestjs/config';

export default registerAs('kakaoOAuthConfig', () => ({
  clientID: process.env.KAKAO_OAUTH_CLIENT_ID,
  clientSecret: process.env.KAKAO_OAUTH_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_OAUTH_CALLBACK_URL,
  authorizationURL: process.env.KAKAO_OAUTH_AUTHORIZATION_URL,
  tokenURL: process.env.KAKAO_OAUTH_TOKEN_URL,
  connectCallbackURL: process.env.KAKAO_OAUTH_CONNECT_CALLBACK_URL,
  disconnectCallbackURL: process.env.KAKAO_OAUTH_DISCONNECT_CALLBACK_URL,
}));

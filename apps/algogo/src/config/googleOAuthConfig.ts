import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuthConfig', () => ({
  clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
  authorizationURL: process.env.GOOGLE_OAUTH_AUTHORIZATION_URL,
  tokenURL: process.env.GOOGLE_OAUTH_TOKEN_URL,
}));

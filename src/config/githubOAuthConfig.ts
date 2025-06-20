import { registerAs } from '@nestjs/config';

export default registerAs('githubOAuthConfig', () => ({
  clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
  clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL,
  authorizationURL: process.env.GITHUB_OAUTH_AUTHORIZATION_URL,
  tokenURL: process.env.GITHUB_OAUTH_TOKEN_URL,
  connectCallbackURL: process.env.GITHUB_OAUTH_CONNECT_CALLBACK_URL,
  disconnectCallbackURL: process.env.GITHUB_OAUTH_DISCONNECT_CALLBACK_URL,
}));

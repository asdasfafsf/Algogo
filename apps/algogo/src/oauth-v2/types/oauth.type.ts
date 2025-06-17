import { OAUTH_PROVIDER } from '../constants/oauth.contant';

export type OAuthProvider =
  (typeof OAUTH_PROVIDER)[keyof typeof OAUTH_PROVIDER];

export type OAuthRequest = Express.Request & {
  user: OAuthRequestUser;
};

export type OAuthRequestUser = {
  provider: OAuthProvider;
  name: string;
  id: string;
  email: string;
  accessToken: string;
};

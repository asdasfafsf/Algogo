import { OAUTH_PROVIDER } from '../../common/constants/oauth.contant';

export type OAuthProvider =
  (typeof OAUTH_PROVIDER)[keyof typeof OAUTH_PROVIDER];

export type OAuthRequest = Express.Request & {
  oauth: OAuthRequestUser;
};

export type OAuthRequestUser = {
  provider: OAuthProvider;
  name: string;
  id: string;
  email: string;
  accessToken: string;
};

export type OAuthConnectRequest = OAuthRequest & {
  params: {
    provider: OAuthProvider;
  };
};

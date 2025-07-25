import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Request } from 'express';

type OAuthConfig = {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  authorizationURL: string;
  tokenURL: string;
  connectCallbackURL: string;
  disconnectCallbackURL: string;
  scope?: string | string[];
  passReqToCallback?: boolean;
  state?: any;
  proxy?: boolean;
  session?: boolean;
  assignProperty?: string;
  property?: string;
};

export function CustomOAuthStrategy(
  StrategyClass: typeof Strategy,
  strategyName: string,
) {
  return class extends PassportStrategy(StrategyClass, strategyName) {
    readonly config: OAuthConfig;

    constructor(config: OAuthConfig) {
      super({
        ...config,
        callbackURL: '',
        session: false,
        assignProperty: 'oauth',
        property: 'oauth',
        passReqToCallback: true,
      });
      this.config = {
        ...config,
        session: false,
        assignProperty: 'oauth',
        property: 'oauth',
        passReqToCallback: true,
      };
    }

    async validate(
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
    ) {
      req.oauth = profile;
      return req?.user ?? profile;
    }

    authenticate(req: Request, options: any) {
      const newOptions = { ...options, ...this.config };
      const requestUrl = req.originalUrl;
      const { destination } = req.query;
      const callbackURL = this.getCallbackUrl(requestUrl);

      if (destination) {
        newOptions.state = JSON.stringify({
          ...newOptions?.state,
          destination,
        });
      }

      newOptions.callbackURL = callbackURL;
      super.authenticate(req, newOptions);
    }

    getCallbackUrl(requestUrl: string): string {
      if (requestUrl.includes('disconnect')) {
        return this.config.disconnectCallbackURL;
      } else if (requestUrl.includes('connect')) {
        return this.config.connectCallbackURL;
      }
      return this.config.callbackURL;
    }
  };
}

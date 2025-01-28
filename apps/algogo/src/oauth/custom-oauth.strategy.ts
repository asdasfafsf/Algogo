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
};

export default function CustomOAuthStrategy(
  StrategyClass: typeof Strategy,
  strategyName: string,
) {
  return class extends PassportStrategy(StrategyClass, strategyName) {
    readonly config: OAuthConfig;

    constructor(config: OAuthConfig) {
      super({ ...config, callbackURL: '', passToReqCallback: true });

      this.config = config;
    }

    authenticate(req: Request, options: any) {
      const newOptions = { ...options, ...this.config };
      const requestUrl = req.originalUrl;
      const callbackURL = this.getCallbackUrl(requestUrl);
      newOptions.callbackURL = callbackURL;
      super.authenticate(req, newOptions);
    }

    getCallbackUrl(requestUrl: string): string {
      if (requestUrl.includes('connect')) {
        return this.config.connectCallbackURL;
      } else if (requestUrl.includes('disconnect')) {
        return this.config.disconnectCallbackURL;
      }
      return this.config.callbackURL;
    }
  };
}

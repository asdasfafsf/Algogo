import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Request } from 'express';

export type OAuthConfig = {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  authorizationURL: string;
  tokenURL: string;
  connectCallbackURL: string;
  disconnectCallbackURL: string;
  scope?: string | string[];
  passReqToCallback?: boolean;
  state?: string | Record<string, unknown>;
  proxy?: boolean;
  session?: boolean;
  assignProperty?: string;
  property?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomOAuthStrategy(
  StrategyClass: typeof Strategy,
  strategyName: string,
): new (config: OAuthConfig) => any {
  class CustomStrategy extends PassportStrategy(StrategyClass, strategyName) {
    readonly config: OAuthConfig;

    constructor(config: OAuthConfig) {
      const { session: _session, ...strategyOptions } = config;
      super({
        ...strategyOptions,
        callbackURL: '',
        assignProperty: 'oauth',
        property: 'oauth',
        passReqToCallback: true,
      } as never);
      this.config = {
        ...config,
        session: false,
        assignProperty: 'oauth',
        property: 'oauth',
        passReqToCallback: true,
      };
    }

    async validate(
      req: Request & { oauth?: Record<string, unknown>; user?: Record<string, unknown> },
      accessToken: string,
      refreshToken: string,
      profile: Record<string, unknown>,
    ) {
      req.oauth = profile;
      return req?.user ?? profile;
    }

    authenticate(req: Request, options: Record<string, unknown>) {
      const newOptions: Record<string, unknown> = { ...options, ...this.config };
      const requestUrl = req.originalUrl;
      const { destination } = req.query;
      const callbackURL = this.getCallbackUrl(requestUrl);

      if (destination) {
        const currentState =
          typeof newOptions?.state === 'object' && newOptions.state !== null
            ? newOptions.state
            : {};
        newOptions.state = JSON.stringify({
          ...currentState,
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
  }

  return CustomStrategy;
}

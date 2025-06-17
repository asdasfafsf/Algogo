import { Injectable } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { OAUTH_PROVIDER } from './constants/oauth.contant';
import { OAuthProvider } from './types/oauth.type';

@Injectable()
export class OAuthGuardFactory {
  private services: { [key in OAuthProvider]: IAuthGuard };

  constructor() {
    this.services = {
      google: new (AuthGuard(OAUTH_PROVIDER.GOOGLE))(),
      kakao: new (AuthGuard(OAUTH_PROVIDER.KAKAO))(),
    };
  }

  get(provider: OAuthProvider): IAuthGuard {
    return this.services[provider];
  }
}

export default OAuthGuardFactory;

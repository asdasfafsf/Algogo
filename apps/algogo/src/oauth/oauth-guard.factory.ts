import { Injectable } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';

@Injectable()
export class OAuthGuardFactory {
  private services: { [key in OAuthProvider]: IAuthGuard };

  constructor() {
    this.services = {
      github: new (AuthGuard(OAuthProvider.GITHUB))(),
      google: new (AuthGuard(OAuthProvider.GOOGLE))(),
      kakao: new (AuthGuard(OAuthProvider.KAKAO))(),
    };
  }

  get(provider: OAuthProvider): IAuthGuard {
    return this.services[provider];
  }
}

export default OAuthGuardFactory;

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { OAuthGuardFactory } from './oauth-guard.factory';

@Injectable()
export class DynamicOAuthGuard implements CanActivate {
  constructor(
    @Inject()
    private readonly oauthGuardFactory: OAuthGuardFactory,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider as OAuthProvider;
    const guard = this.oauthGuardFactory.get(provider);
    return guard.canActivate(context) as Promise<boolean>;
  }
}

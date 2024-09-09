import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';

@Injectable()
export class DynamicOAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider as OAuthProvider;
    const guard = new (AuthGuard(provider))();
    return guard.canActivate(context) as Promise<boolean>;
  }
}

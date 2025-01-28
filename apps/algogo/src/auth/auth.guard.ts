import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NO_JWT_MESSAGE } from '../common/constants/ErrorMessage';
import { CustomLogger } from '../logger/custom-logger';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: CustomLogger,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const encryptedToken = this.extractTokenFromHeader(request);

    this.logger.silly('auth guard 1');
    if (!encryptedToken) {
      throw new UnauthorizedException(NO_JWT_MESSAGE);
    }

    this.logger.silly('auth guard 2');
    const decodedToken = await this.authService.decodeJwt(encryptedToken);
    this.logger.silly('end decodeJWT', {
      decodedToken,
    });
    const { userNo } = decodedToken;

    request.userNo = Number(userNo);
    request.user = decodedToken;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [typeFromHeader, tokenFromHeader] =
      request?.headers['authorization']?.split(' ') ?? [];
    if (typeFromHeader === 'Bearer' && tokenFromHeader) {
      return tokenFromHeader;
    }

    const [typeFromCookie, tokenFromCookie] =
      request?.cookies?.authorization?.split(' ') ?? [];
    if (typeFromCookie === 'Bearer' && tokenFromCookie) {
      return tokenFromCookie;
    }

    return undefined;
  }
}

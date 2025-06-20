import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { JwtMissingTokenException } from '../common/errors/token/JwtMissingTokenException';
import { Request } from 'express';

@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new JwtMissingTokenException();
    }

    const payload = await this.jwtService.verify(token);
    request.user = { ...payload, refreshToken: token };
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

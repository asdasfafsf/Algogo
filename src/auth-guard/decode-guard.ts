import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { Request } from 'express';

@Injectable()
export class DecodeGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      request.user = null;
      return true;
    }

    const payload = await this.jwtService.verify(token);
    request.user = payload;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // 1. 쿠키의 access_token을 우선 확인
    const cookieToken = request?.cookies?.access_token;
    if (cookieToken) {
      return cookieToken;
    }

    // 2. Authorization 헤더에서 Bearer 토큰 확인
    const [typeFromHeader, tokenFromHeader] =
      request?.headers['authorization']?.split(' ') ?? [];
    if (typeFromHeader === 'Bearer' && tokenFromHeader) {
      return tokenFromHeader;
    }

    // 3. 기존 authorization 쿠키에서 Bearer 토큰 확인 (하위 호환성)
    const [typeFromCookie, tokenFromCookie] =
      request?.cookies?.authorization?.split(' ') ?? [];
    if (typeFromCookie === 'Bearer' && tokenFromCookie) {
      return tokenFromCookie;
    }

    return undefined;
  }
}

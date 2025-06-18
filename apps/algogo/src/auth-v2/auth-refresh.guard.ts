import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return false;

    const payload = await this.jwtService.verify(token); // 이미 다중 시크릿 지원
    request.user = { ...payload, refreshToken: token };
    return true;
  }

  private extractToken(request: any): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}

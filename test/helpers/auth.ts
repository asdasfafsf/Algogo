import { INestApplication } from '@nestjs/common';
import { JwtService } from '../../src/jwt/jwt.service';
import { Role } from '../../src/common/types/roles.type';

export async function getAccessToken(
  app: INestApplication,
  { sub, roles }: { sub: string; roles: Role[] },
): Promise<string> {
  const jwtService = app.get(JwtService);
  return jwtService.sign({ sub, roles }, 300);
}

export async function getRefreshToken(
  app: INestApplication,
  { sub }: { sub: string },
): Promise<string> {
  const jwtService = app.get(JwtService);
  return jwtService.sign({ sub }, 3600);
}

export function createAuthHeaders(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function createAuthCookies(
  accessToken: string,
  refreshToken?: string,
): string {
  const cookies = [`access_token=${accessToken}`];
  if (refreshToken) {
    cookies.push(`refresh_token=${refreshToken}`);
  }
  return cookies.join('; ');
}

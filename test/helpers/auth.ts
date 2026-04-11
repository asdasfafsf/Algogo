import { INestApplication } from '@nestjs/common';
import { JwtService } from '../../src/jwt/jwt.service';
import { Role } from '../../src/common/types/roles.type';

export async function getAccessToken(
  app: INestApplication,
  { sub, roles }: { sub: string; roles: Role[] },
): Promise<string> {
  const jwtService = app.get(JwtService);
  return jwtService.sign({ sub, roles });
}

export async function getRefreshToken(
  app: INestApplication,
  { sub }: { sub: string },
): Promise<string> {
  const jwtService = app.get(JwtService);
  return jwtService.sign({ sub });
}

export function createAuthHeaders(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function createAuthCookies(
  accessToken: string,
  refreshToken?: string,
): string {
  const cookies = [`accessToken=${accessToken}`];
  if (refreshToken) {
    cookies.push(`refreshToken=${refreshToken}`);
  }
  return cookies.join('; ');
}

import { Request } from 'express';
import { Role } from './roles.type';

export type TokenUser = {
  sub: string;
  roles: Role[];
};

export type AuthRequest = Request & {
  user: TokenUser;
};

export type RefreshTokenRequest = Request & {
  user: TokenUser & {
    refreshToken: string;
  };
};

export type RequestMetadata = {
  ip: string;
  userAgent: string;
};

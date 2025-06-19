import { Request } from 'express';

export type TokenUser = {
  sub: string;
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

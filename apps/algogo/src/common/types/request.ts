import { Request } from 'express';

export type AuthRequest = Request & {
  user: {
    sub: string;
  };
};

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as requestIp from 'request-ip';

@Injectable()
export class RequestMetadataMiddleware implements NestMiddleware {
  use(req: Request & { metadata?: { ip: string | null; userAgent?: string } }, res: Response, next: NextFunction) {
    req.metadata = {
      ip: requestIp.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };
    next();
  }
}

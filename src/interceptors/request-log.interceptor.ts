import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import type { Request, Response } from 'express';
import { AppLogger } from '../logger/app-logger';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLogger,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = Date.now();
    let logged = false;
    const logRequest = () => {
      if (logged) return;
      logged = true;
      this.logRequest(req, res, start);
    };
    res.once('finish', logRequest);
    res.once('close', logRequest);

    return next.handle();
  }

  private logRequest(req: Request, res: Response, start: number): void {
    this.logger.log('access', {
      type: 'access',
      requestId: this.cls.get('requestId'),
      traceId: this.cls.get('traceId'),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      ip:
        (req.headers['cf-connecting-ip'] as string) ||
        (req.headers['x-forwarded-for'] as string) ||
        req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}

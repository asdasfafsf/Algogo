import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from 'winston';
import { ClsService } from 'nestjs-cls';
import { Request, Response } from 'express';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(
    @Inject('winston')
    private readonly winston: Logger,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logRequest(req, context, start),
        error: () => this.logRequest(req, context, start),
      }),
    );
  }

  private logRequest(req: Request, context: ExecutionContext, start: number) {
    const res = context.switchToHttp().getResponse<Response>();
    this.winston.info('access', {
      type: 'access',
      requestId: this.cls.get('requestId'),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: (req.headers['cf-connecting-ip'] as string) || (req.headers['x-forwarded-for'] as string) || req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}

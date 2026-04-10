import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const end = this.requestDuration.startTimer();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const labels = {
            method: req.method,
            path: req.route?.path ?? req.path,
            status: String(res.statusCode),
          };
          this.requestCounter.inc(labels);
          end(labels);
        },
        error: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const labels = {
            method: req.method,
            path: req.route?.path ?? req.path,
            status: String(res.statusCode || 500),
          };
          this.requestCounter.inc(labels);
          end(labels);
        },
      }),
    );
  }
}

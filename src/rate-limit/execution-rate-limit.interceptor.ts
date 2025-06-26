import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ExecutionRateLimitService } from './execution-rate-limit.service';

@Injectable()
export class ExecutionRateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly executionRateLimitService: ExecutionRateLimitService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'ws') {
      return next.handle();
    }

    const client = context.switchToWs().getClient();
    const userUuid = client.user?.sub;
    const started = Date.now();
    return next.handle().pipe(
      finalize(() => {
        const duration = (Date.now() - started) / 1000;
        if (userUuid)
          console.log('commitExecutionDuration', userUuid, duration);
          this.executionRateLimitService.commitExecutionDuration(
            userUuid,
            duration,
          );
      }),
    );
  }
}

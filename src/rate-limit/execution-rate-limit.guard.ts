import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ExecutionRateLimitService } from './execution-rate-limit.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ExecutionRateLimitGuard implements CanActivate {
  constructor(
    private readonly executionRateLimitService: ExecutionRateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const user = client.user;

    const allowed = await this.executionRateLimitService.tryConsumeRequestToken(
      user.sub,
    );

    if (!allowed) {
      throw new WsException({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
      });
    }

    return true;
  }
}

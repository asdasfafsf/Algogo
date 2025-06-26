import { Module } from '@nestjs/common';
import { ExecutionRateLimitService } from './execution-rate-limit.service';
import { RedisModule } from '../redis/redis.module';
import { ExecutionRateLimitGuard } from './execution-rate-limit.guard';

@Module({
  imports: [RedisModule],
  providers: [ExecutionRateLimitService, ExecutionRateLimitGuard],
  exports: [ExecutionRateLimitService, ExecutionRateLimitGuard],
})
export class RateLimitModule {}

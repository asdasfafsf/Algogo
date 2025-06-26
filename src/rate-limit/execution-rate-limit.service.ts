import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ExecutionRateLimitService {
  constructor(private readonly redisService: RedisService) {}

  private readonly requestBucketCapacity = 20;
  private readonly requestRefillRate = 20;

  private readonly usageBucketCapacity = 0.1;
  private readonly usageRefillRate = 0.1 / 60;

  async tryConsumeRequestToken(userUuid: string): Promise<boolean> {
    const lua = `
      local requestKey = KEYS[1]
      local usageKey = KEYS[2]
      local now = tonumber(ARGV[1])
      local requestCap = tonumber(ARGV[2])
      local requestRate = tonumber(ARGV[3])
      local usageCap = tonumber(ARGV[4])
      local usageRate = tonumber(ARGV[5])

      local req = redis.call("HMGET", requestKey, "tokens", "last")
      local reqTokens = tonumber(req[1]) or requestCap
      local reqLast = tonumber(req[2]) or now
      local reqElapsed = now - reqLast
      reqTokens = math.min(requestCap, reqTokens + reqElapsed * requestRate)

      if reqTokens < 1 then return {0, reqTokens} end

      redis.call("HMSET", requestKey, "tokens", reqTokens - 1, "last", now)
      redis.call("EXPIRE", requestKey, 60)

      return {1, reqTokens - 1}
    `;
    const now = Math.floor(Date.now() / 1000);
    const [allowed] = await this.redisService.eval<[number, number]>(
      lua,
      2,
      `compiler_request:${userUuid}`,
      `compiler_usage:${userUuid}`,
      now,
      this.requestBucketCapacity,
      this.requestRefillRate,
      this.usageBucketCapacity,
      this.usageRefillRate,
    );

    return allowed === 1;
  }

  async commitExecutionDuration(
    userUuid: string,
    durationSec: number,
  ): Promise<void> {
    const lua = `
      local usageKey = KEYS[1]
      local now = tonumber(ARGV[1])
      local duration = tonumber(ARGV[2])
      local usageCap = tonumber(ARGV[3])
      local usageRate = tonumber(ARGV[4])

      local u = redis.call("HMGET", usageKey, "tokens", "last")
      local tokens = tonumber(u[1]) or usageCap
      local last = tonumber(u[2]) or now
      local elapsed = now - last
      tokens = math.min(usageCap, tokens + elapsed * usageRate)

      tokens = tokens - duration
      redis.call("HMSET", usageKey, "tokens", tokens, "last", now)
      redis.call("EXPIRE", usageKey, 60)
      return tokens
    `;
    const now = Math.floor(Date.now() / 1000);
    await this.redisService.eval(
      lua,
      1,
      `compiler_usage:${userUuid}`,
      now,
      durationSec,
      this.usageBucketCapacity,
      this.usageRefillRate,
    );
  }
}

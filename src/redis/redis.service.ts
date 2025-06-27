import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  REDIS_CLIENT,
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from './redis.constants';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    @Inject(REDIS_PUB_CLIENT) private readonly redisPubClient: RedisClientType,
    @Inject(REDIS_SUB_CLIENT) private readonly redisSubClient: RedisClientType,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value, ttl ? { EX: ttl } : undefined);
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
    return;
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  async subscribe(channel: string) {
    return new Promise((resolve) => {
      this.redisSubClient.subscribe(channel, (response) => {
        resolve(response);
      });
    });
  }

  async unsubscribe(channel: string) {
    await this.redisSubClient.unsubscribe(channel);
  }

  async publish(channel: string, message: string) {
    return await this.redisPubClient.publish(channel, message);
  }

  async eval<T = unknown>(
    script: string,
    numKeys: number,
    ...keysAndArgs: (string | number)[]
  ): Promise<T> {
    const keys = keysAndArgs.slice(0, numKeys).map(String);
    const args = keysAndArgs.slice(numKeys).map(String);
    return (await this.redisClient.eval(script, {
      keys,
      arguments: args,
    })) as T;
  }

  onModuleDestroy() {
    this.redisClient.quit();
    this.redisPubClient.quit();
    this.redisSubClient.quit();
  }
}

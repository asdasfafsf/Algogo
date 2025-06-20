import { Module, DynamicModule, Global } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import {
  REDIS_CLIENT,
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from './redis.constants';
import { RedisService } from './redis.service';

export interface RedisModuleOptions {
  host: string;
  port: number;
  password?: string;
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  static forRootAsync(options: RedisModuleOptions): DynamicModule {
    const redisClientProvider = {
      provide: REDIS_CLIENT,
      useFactory: async (): Promise<RedisClientType> => {
        const { host, port, password } = options;
        const client = createClient({
          url: `redis://${host}:${port}`,
          password,
        }) as RedisClientType;

        client.on('connect', async () => {});
        client.on('end', async () => {});
        client.on('error', async () => {});

        await client.connect();
        return client;
      },
    };

    const pubClientProvider = {
      provide: REDIS_PUB_CLIENT,
      useFactory: async (): Promise<RedisClientType> => {
        const { host, port, password } = options;
        const pubClient = createClient({
          url: `redis://${host}:${port}`,
          password,
        }) as RedisClientType;

        pubClient.on('connect', async () => {});
        pubClient.on('end', async () => {});
        pubClient.on('error', async () => {});

        await pubClient.connect();
        return pubClient;
      },
    };

    const subClientProvider = {
      provide: REDIS_SUB_CLIENT,
      useFactory: async (): Promise<RedisClientType> => {
        const { host, port, password } = options;
        const subClient = createClient({
          url: `redis://${host}:${port}`,
          password,
        }) as RedisClientType;

        subClient.on('connect', async () => {});
        subClient.on('end', async () => {});
        subClient.on('error', async () => {});

        await subClient.connect();
        return subClient;
      },
    };

    return {
      module: RedisModule,
      providers: [redisClientProvider, pubClientProvider, subClientProvider],
      exports: [redisClientProvider, pubClientProvider, subClientProvider],
    };
  }
}

import { Module, DynamicModule, Global } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import {
  REDIS_CLIENT,
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from './redis.constants';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import redisConfig from '../config/redisConfig';

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    const redisClientProvider = {
      provide: REDIS_CLIENT,
      inject: [redisConfig.KEY],
      useFactory: async (
        config: ConfigType<typeof redisConfig>,
      ): Promise<RedisClientType> => {
        const { host = 'localhost', port, password } = config;
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
      inject: [redisConfig.KEY],
      useFactory: async (
        config: ConfigType<typeof redisConfig>,
      ): Promise<RedisClientType> => {
        const { host = 'localhost', port, password } = config;
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
      inject: [redisConfig.KEY],
      useFactory: async (
        config: ConfigType<typeof redisConfig>,
      ): Promise<RedisClientType> => {
        const { host = 'localhost', port, password } = config;
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
      imports: [ConfigModule.forFeature(redisConfig)],
      providers: [
        RedisService,
        redisClientProvider,
        pubClientProvider,
        subClientProvider,
      ],
      exports: [
        RedisService,
        redisClientProvider,
        pubClientProvider,
        subClientProvider,
      ],
    };
  }
}

import { Module, DynamicModule, Global } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
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
    const clientProvider = {
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

    return {
      module: RedisModule,
      providers: [clientProvider],
      exports: [clientProvider],
    };
  }
}

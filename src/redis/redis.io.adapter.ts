import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplication } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import redisConfig from '../config/redisConfig';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;
  private readonly redisCfg: ConfigType<typeof redisConfig>;
  private clients: ReturnType<typeof createClient>[] = [];

  constructor(app: INestApplication) {
    super(app);
    this.redisCfg = app.get(redisConfig.KEY);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://${this.redisCfg.host}:${this.redisCfg.port}`,
      password: this.redisCfg.password,
    });
    const subClient = pubClient.duplicate();
    this.clients = [pubClient, subClient];

    await pubClient.connect();
    await subClient.connect();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(
    port: number,
    options?: ServerOptions,
  ): ReturnType<IoAdapter['createIOServer']> {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }

  async close(server: Server): Promise<void> {
    await super.close(server);
    await Promise.all(
      this.clients
        .filter((client) => client.isOpen)
        .map((client) => client.quit()),
    );
  }
}

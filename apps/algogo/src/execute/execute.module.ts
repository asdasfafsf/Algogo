import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { ConfigType } from '@nestjs/config';
import bullmqConfig from '../config/bullmqConfig';
import { ExecuteGateway } from './execute.gateway';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [],
      inject: [bullmqConfig.KEY],
      useFactory: async (config: ConfigType<typeof bullmqConfig>) => {
        return {
          connection: {
            host: config.host,
            port: config.port,
            password: config.password,
          },
        };
      },
    }),
    BullModule.registerQueueAsync({
      imports: [],
      inject: [bullmqConfig.KEY],
      useFactory: async (config: ConfigType<typeof bullmqConfig>) => {
        return {
          name: config.queueName,
          connection: {
            host: config.host,
            port: config.port,
            password: config.password,
          },
        };
      },
    }),
    AuthModule,
  ],
  controllers: [ExecuteController],
  providers: [ExecuteService, ExecuteGateway],
})
export class ExecuteModule {}

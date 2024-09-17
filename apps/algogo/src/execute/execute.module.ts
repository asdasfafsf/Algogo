import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import bullmqConfig from '../config/bullmqConfig';
import { ExecuteGateway } from './execute.gateway';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      inject: [bullmqConfig.KEY],
      useFactory: (config: ConfigType<typeof bullmqConfig>) => ({
        connection: {
          ...config,
        },
      }),
    }),
    BullModule.registerQueueAsync({
      inject: [bullmqConfig.KEY],
      useFactory: (config: ConfigType<typeof bullmqConfig>) => ({
        name: config.queueName,
        connection: {
          ...config,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [ExecuteController],
  providers: [ExecuteService, ExecuteGateway],
})
export class ExecuteModule {}

import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { ConfigType } from '@nestjs/config';
import bullmqConfig from '../config/bullmqConfig';
import { ExecuteGateway } from './execute.gateway';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.BULLMQ_HOST,
        port: Number(process.env.BULLMQ_PORT),
        password: process.env.BULLMQ_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: process.env.BULLMQ_QUEUE_NAME,
      connection: {
        host: process.env.BULLMQ_HOST,
        port: Number(process.env.BULLMQ_PORT),
        password: process.env.BULLMQ_PASSWORD,
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [ExecuteController],
  providers: [ExecuteService, ExecuteGateway],
})
export class ExecuteModule {}




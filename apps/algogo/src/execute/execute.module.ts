import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigType } from '@nestjs/config';
import bullmqConfig from '../config/bullmqConfig';
import { ExecuteGateway } from './execute.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { CryptoModule } from '../crypto/crypto.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      inject: [bullmqConfig.KEY],
      useFactory: (config: ConfigType<typeof bullmqConfig>) => ({
        connection: {
          ...config,
        },
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: true,
          removeOnFail: true,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    CryptoModule,
    AuthGuardModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [ExecuteController],
  providers: [ExecuteService, ExecuteGateway],
})
export class ExecuteModule {}

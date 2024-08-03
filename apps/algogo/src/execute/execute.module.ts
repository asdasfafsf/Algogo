import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => ({
        connection: {
          host: process.env.BULLMQ_HOST,
          port: Number(process.env.BULLMQ_PORT),
          password: process.env.BLLMQ_PASSWORD,
        },
      }),
    }),
    BullModule.registerQueue({
      name: process.env.BULLMQ_QUEUE_NAME,
    }),
    AuthModule,
  ],
  controllers: [ExecuteController],
  providers: [ExecuteService],
})
export class ExecuteModule {}

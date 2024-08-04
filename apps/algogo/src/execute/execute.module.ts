import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import bullmqConfig from '../config/bullmqConfig';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => ({
        connection: {
          host: process.env.BULLMQ_HOST,
          port: Number(process.env.BULLMQ_PORT),
          password: process.env.BULLMQ_PASSWORD,
        },
      }),
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config: ConfigType<typeof bullmqConfig> = configService.get(
          bullmqConfig.KEY,
        );
        console.log('dddd');
        console.log(config);
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
  providers: [ExecuteService],
})
export class ExecuteModule {}

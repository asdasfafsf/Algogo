import { Module } from '@nestjs/common';
import { ExecuteModule } from './execute/execute.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import bullmqConfig from './config/bullmqConfig';
import { validationSchema } from './config/validationSchema';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      load: [config, bullmqConfig],
      isGlobal: true,
      validationSchema,
    }),
    ExecuteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ExecuteModule } from './execute/execute.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import bullmqConfig from './config/bullmqConfig';
import { validationSchema } from './config/validationSchema';

@Module({
  imports: [
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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validationSchema';
import { CrawlerModule } from './crawler/crawler.module';
import crawlerConfig from './config/crawlerConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      load: [crawlerConfig],
      isGlobal: true,
      validationSchema,
    }),
    CrawlerModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validationSchema';
import { CrawlerModule } from './crawler/crawler.module';
import crawlerConfig from './config/crawlerConfig';
import { ProblemsModule } from './problems/problems.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      load: [crawlerConfig],
      isGlobal: true,
      validationSchema,
    }),
    CrawlerModule,
    ProblemsModule,
    S3Module,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProblemCrawlerModule } from '../problem-crawler/problem-crawler.module';

@Module({
  imports: [ProblemCrawlerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

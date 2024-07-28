import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [CrawlerController],
  providers: [CrawlerService],
  imports: [HttpModule],
  exports: [CrawlerService],
})
export class CrawlerModule {}

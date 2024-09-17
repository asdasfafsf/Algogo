import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [],
  providers: [CrawlerService],
  imports: [HttpModule],
  exports: [CrawlerService],
})
export class CrawlerModule {}

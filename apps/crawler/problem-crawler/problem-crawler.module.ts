import { Module } from '@nestjs/common';
import { ProblemCralwerFactory } from './problem-crawler-factory';
import { AcmicpcService } from './acmicpc.service';
import { HttpModule } from '@nestjs/axios';
import { ProblemCrawlerService } from './problem-crawler.service';

@Module({
  imports: [HttpModule],
  providers: [ProblemCralwerFactory, AcmicpcService, ProblemCrawlerService],
  exports: [ProblemCrawlerService],
})
export class ProblemCrawlerModule {}

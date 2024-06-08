import { Module } from '@nestjs/common';
import { ProblemCralwerFactory } from './problem-cralwer-factory';
import { AcmicpcService } from './acmicpc.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ProblemCralwerFactory, AcmicpcService],
  exports: [ProblemCralwerFactory, AcmicpcService],
})
export class ProblemCrawlerModule {}

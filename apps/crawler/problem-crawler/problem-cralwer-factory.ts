import { Injectable } from '@nestjs/common';
import { AcmicpcService } from './acmicpc.service';
import { ProblemCralwer } from './problem-crawler.interface';

@Injectable()
export class ProblemCralwerFactory {
  constructor(private readonly acmicpcService: AcmicpcService) {}

  getInstance(crawlerSite: string): ProblemCralwer {
    switch (crawlerSite) {
      case 'BOJ':
      default:
        return this.acmicpcService;
    }
  }
}

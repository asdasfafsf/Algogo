import { Injectable } from '@nestjs/common';
import { ProblemCralwerFactory } from './problem-crawler-factory';
import { CralwerCookieDto } from '@libs/common/dto/CrawlerCookieDto';

@Injectable()
export class ProblemCrawlerService {
  constructor(private readonly problemCrawlerFactory: ProblemCralwerFactory) {}

  getProblemList(
    crawlerSite: string,
    startPage: number = 1,
    endPage: number = 1,
    cookies?: CralwerCookieDto[],
  ) {
    const cralwer = this.problemCrawlerFactory.getInstance(crawlerSite);
    return cralwer.getProblemList(startPage, endPage, cookies);
  }
  getProblem(crawlerSite: string, key: string, cookies?: CralwerCookieDto[]) {
    const cralwer = this.problemCrawlerFactory.getInstance(crawlerSite);
    return cralwer.getProblem(key, cookies);
  }
}

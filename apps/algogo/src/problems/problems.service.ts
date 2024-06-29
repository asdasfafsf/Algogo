import { Injectable } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';

@Injectable()
export class ProblemsService {
  constructor(private readonly cralwerService: CrawlerService) {}

  async collectProblem(site: string, key: string) {
    const result = await this.cralwerService.getProblem(site, key);

    return result;
  }

  async postProcess() {}
}

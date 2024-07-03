import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('/')
  async getProblem() {
    return await this.crawlerService.getProblem('BOJ', '1001');
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';

@Injectable()
export class ProblemsService {
  constructor(private readonly cralwerService: CrawlerService) {}

  async collectProblem(site: string, key: string) {
    const result = await this.cralwerService.getProblem(site, key);

    if (result.errorCode !== '0000') {
      throw new BadRequestException('크롤링 수집 오류');
    }

    const data = result.data;
    const { contentList } = data;
    const newContentList = contentList.map(async (elem) => {
      const { type, value } = elem;

      if (type === 'image') {
      }

      return elem;
    });

    return result;
  }

  async postProcess() {}
}

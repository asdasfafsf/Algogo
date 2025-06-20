import { BadRequestException, Injectable } from '@nestjs/common';
import { ProblemSiteNotFoundException } from './errors/ProblemSiteNotFoundException';
import { ProblemsCollectRepository } from './problems-collect.repository';
import { RedisService } from '../redis/redis.service';
import { CrawlerService } from '../crawler/crawler.service';
import { ResponseProblemContent } from './dto/ResponseProblemContent';
import { ImageService } from '../image/image.service';
import { S3Service } from '../s3/s3.service';
import { CustomLogger } from '../logger/custom-logger';
@Injectable()
export class ProblemsCollectService {
  constructor(
    private readonly problemsCollectRepository: ProblemsCollectRepository,
    private readonly redisService: RedisService,
    private readonly crawlerService: CrawlerService,
    private readonly imageService: ImageService,
    private readonly s3Service: S3Service,
    private readonly logger: CustomLogger,
  ) {}

  async collect({ url, userNo }: { url: string; userNo: number }) {
    console.log(url, userNo);
    throw new Error('Not implemented');
  }

  private getSecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const secondsUntilMidnight = Math.floor(
      (midnight.getTime() - now.getTime()) / 1000,
    );

    return secondsUntilMidnight;
  }

  private parse(url: string) {
    if (url.includes('https://www.acmicpc.net/problem/')) {
      const sourceId = url.split('problem/')[1].split('/')[0].trim();

      return { source: 'BOJ', sourceId };
    }

    throw new ProblemSiteNotFoundException();
  }

  private async postProcess(
    contentList: ResponseProblemContent[],
    site: string,
    key: string,
  ) {
    return await Promise.all(
      contentList.map(async (elem, index) => {
        const { type, content } = elem;

        if (type === 'image') {
          const buffer = Buffer.from(content, 'hex');
          const webp = await this.imageService.toWebp(buffer);
          const s3Key = `problems/${site}/${key}_${index}.webp`;
          const s3Result = await this.s3Service.upload(s3Key, webp);

          if (!s3Result) {
            throw new BadRequestException('이미지 업로드 오류');
          }

          return {
            order: index,
            type: 'image',
            content: s3Result,
            cellList: elem.cellList,
          };
        }

        return elem;
      }),
    );
  }
}

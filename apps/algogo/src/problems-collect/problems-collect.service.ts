import { BadRequestException, Injectable } from '@nestjs/common';
import { ProblemSiteNotFoundException } from './errors/ProblemSiteNotFoundException';
import { ProblemsCollectRepository } from './problems-collect.repository';
import { RedisService } from '../redis/redis.service';
import { ProblemUpdateLimitException } from './errors/ProblemUpdateLimitException';
import { CrawlerService } from '../crawler/crawler.service';
import { ResponseProblemContent } from '@libs/core/dto/ResponseProblemContent';
import { ImageService } from '../image/image.service';
import { S3Service } from '../s3/s3.service';
@Injectable()
export class ProblemsCollectService {
  constructor(
    private readonly problemsCollectRepository: ProblemsCollectRepository,
    private readonly redisService: RedisService,
    private readonly crawlerService: CrawlerService,
    private readonly imageService: ImageService,
    private readonly s3Service: S3Service,
  ) {}

  async collect({ url, userNo }: { url: string; userNo: number }) {
    const requestCount = await this.redisService.get(
      `problemCollectCount_${userNo}`,
    );
    if (requestCount && Number(requestCount) >= 10) {
      throw new ProblemUpdateLimitException();
    }

    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const secondsUntilMidnight = Math.floor(
      (midnight.getTime() - now.getTime()) / 1000,
    );

    await this.redisService.set(
      `problemCollectCount_${userNo}`,
      (Number(requestCount || 0) + 1).toString(),
      secondsUntilMidnight,
    );

    const { site, sourceId } = this.parse(url);
    const result = await this.crawlerService.getProblem(site, sourceId);
    const contentList = await this.postProcess(
      result.data.contentList,
      site,
      sourceId,
    );

    const problem = await this.problemsCollectRepository.upsertProblem({
      ...result.data,
      contentList,
    });
    await this.problemsCollectRepository.insertCollectionLog({
      userNo,
      url,
      state: '0',
      cause: '',
    });

    return problem.uuid;
  }

  private parse(url: string) {
    if (url.includes('https://www.acmicpc.net/problem/')) {
      const sourceId = url.split('problem/')[1].split('/')[0].trim();

      return { site: 'BOJ', sourceId };
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
          };
        }

        return elem;
      }),
    );
  }
}

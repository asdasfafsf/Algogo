import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { ImageService } from '../image/image.service';
import { S3Service } from '../s3/s3.service';
import S3Config from '../config/s3Config';
import { ConfigType } from '@nestjs/config';
import { ResponseProblemContent } from '@libs/core/dto/ResponseProblemContent';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemsService {
  constructor(
    private readonly imageService: ImageService,
    private readonly crawlerService: CrawlerService,
    private readonly s3Service: S3Service,
    @Inject(S3Config.KEY)
    private readonly s3Config: ConfigType<typeof S3Config>,
    private readonly prismaService: PrismaService,
  ) {}

  async collectProblem(site: string, key: string) {
    const result = await this.crawlerService.getProblem(site, key);

    if (result.errorCode !== '0000') {
      throw new BadRequestException('크롤링 수집 오류');
    }

    const data = result.data;
    const contentList = await this.postProcess(data.contentList, site, key);

    const res = await this.prismaService.$transaction(async (tx) => {
      const inserted = await tx.problem.create({
        data: {
          title: data.title,
          level: data.level,
          levelText: data.levelText,
          updatedDate: new Date(),
          input: data.input,
          output: data.output,
          limit: data.limit,
          answerCount: data.answerCount,
          answerPeopleCount: data.answerPeopleCount,
          submitCount: data.submitCount,
          timeout: data.timeout,
          memoryLimit: data.memoryLimit,
          source: data.source,
          sourceId: data.sourceId,
          sourceUrl: data.sourceUrl,
          contentList: {
            create: contentList,
          },
          typeList: {
            create: data.typeList.map((name) => ({ name })),
          },
          inputOutputList: {
            create: data.inputOutputList,
          },
        },
      });

      return inserted;
    });

    return res;
  }

  async postProcess(
    contentList: ResponseProblemContent[],
    site: string,
    key: string,
  ) {
    return Promise.all(
      contentList.map(async (elem, index) => {
        const { type, content } = elem;

        if (type === 'image') {
          const response = await this.crawlerService.getResource(content);
          const { statusCode, data } = response;

          if (statusCode !== HttpStatus.OK) {
            throw new BadRequestException('크롤링 리소스 수집 오류');
          }

          const webp = await this.imageService.toWebp(data);
          const s3Result = await this.s3Service.upload(
            `problems/${site}/${key}_${index}.webp`,
            webp,
          );

          if (!s3Result) {
            throw new BadRequestException('이미지 업로드 오류');
          }

          return {
            order: index,
            type: 'image',
            content: `https://${this.s3Config.bucketName}.s3.${this.s3Config.region}.amazonaws.com/problems/${site}/${key}_${index}.webp`,
          };
        }

        return elem;
      }),
    );
  }
}

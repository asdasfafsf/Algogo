import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { ImageService } from '../image/image.service';
import { S3Service } from '../s3/s3.service';
import { ResponseProblemContent } from '@libs/core/dto/ResponseProblemContent';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class ProblemsCollectService {
  constructor(
    private readonly logger: CustomLogger,
    private readonly imageService: ImageService,
    private readonly crawlerService: CrawlerService,
    private readonly s3Service: S3Service,
    private readonly prismaService: PrismaService,
  ) {}

  async collectProblem(site: string, key: string) {
    const result = await this.crawlerService.getProblem(site, key);

    this.logger.silly(`${ProblemsCollectService.name} collectProblem`, {});

    if (result.statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException('존재하지 않는 문제 입니다.');
    }
    if (result.errorCode !== '0000') {
      throw new BadRequestException('크롤링 수집 오류');
    }

    const data = result.data;
    const contentList = await this.postProcess(data.contentList, site, key);

    this.logger.silly(
      `${ProblemsCollectService.name} postprocess`,
      contentList,
    );

    try {
      const res = await this.prismaService.$transaction(async (tx) => {
        const inserted = await tx.problem.upsert({
          where: {
            source_sourceId: {
              sourceId: data.sourceId,
              source: data.source,
            },
          },
          update: {
            title: data.title,
            level: data.level,
            levelText: data.levelText,
            updatedDate: new Date(),
            input: data.input,
            output: data.output,
            limit: data.limit,
            answerCount: data.answerCount,
            answerRate: data.answerRate,
            answerPeopleCount: data.answerPeopleCount,
            submitCount: data.submitCount,
            timeout: data.timeout,
            memoryLimit: data.memoryLimit,
            source: data.source,
            sourceId: data.sourceId,
            sourceUrl: data.sourceUrl,
            contentList: {
              deleteMany: {}, // 기존 데이터 삭제
              create: contentList, // 새 데이터 삽입
            },
            typeList: {
              deleteMany: {}, // 기존 데이터 삭제
              create: data.typeList.map((name) => ({ name })), // 새 데이터 삽입
            },
            inputOutputList: {
              deleteMany: {}, // 기존 데이터 삭제
              create: data.inputOutputList, // 새 데이터 삽입
            },
          },
          create: {
            title: data.title,
            level: data.level,
            levelText: data.levelText,
            updatedDate: new Date(),
            updatedAt: new Date(),
            input: data.input,
            output: data.output,
            limit: data.limit,
            answerCount: data.answerCount,
            answerRate: data.answerRate,
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
    } catch (e) {
      this.logger.error(
        `${ProblemsCollectService.name} PrismaClientInitializationError`,
        {
          message: e.message,
        },
      );
      throw new InternalServerErrorException('데이터 삽입 에러');
    }
  }

  async postProcess(
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

          this.logger.silly(
            `${ProblemsCollectService.name} s3Upload_${index}`,
            { s3Result },
          );

          if (!s3Result) {
            this.logger.error(
              `${ProblemsCollectService.name} s3Upload_${index}`,
              {
                requestUrl: content,
              },
            );
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

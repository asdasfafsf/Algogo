import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { ImageService } from '../image/image.service';
import { S3Service } from '../s3/s3.service';
import S3Config from '../config/s3Config';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';

@Injectable()
export class ProblemsService {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
    private readonly imageService: ImageService,
    private readonly crawlerService: CrawlerService,
    private readonly s3Service: S3Service,
    @Inject(S3Config.KEY)
    private readonly s3Config: ConfigType<typeof S3Config>,
    private readonly prismaService: PrismaService,
  ) {}

  async getProblemSummaryList() {
    try {
      const problemSummaryList = await this.prismaService.problem.findMany({
        select: {
          no: false,
          uuid: true,
          title: true,
          level: true,
          levelText: true,
          answerCount: true,
          submitCount: true,
          answerPeopleCount: true,
          source: true,
          sourceId: true,
          sourceUrl: true,
          typeList: {
            select: {
              name: true,
            },
          },
        },
        where: {},
        skip: 0,
        take: 10,
      });

      return problemSummaryList.map((summary) => {
        return {
          ...summary,
          key: summary.source,
        };
      });
    } catch (e) {
      this.logger.error(`${ProblemsService.name} getProblemSummaryList`, {
        message: e.message,
      });

      throw e;
    }
  }

  async getProblem(uuid: string) {
    try {
      const problem = await this.prismaService.problem.findUnique({
        select: {
          no: false,
          uuid: true,
          title: true,
          level: true,
          levelText: true,
          input: true,
          output: true,
          hint: true,
          answerCount: true,
          answerPeopleCount: true,
          submitCount: true,
          timeout: true,
          memoryLimit: true,
          source: true,
          sourceId: true,
          sourceUrl: true,
          contentList: {
            select: {
              order: true,
              type: true,
              content: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          inputOutputList: {
            select: {
              order: true,
              input: true,
              output: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          typeList: {
            select: {
              name: true,
            },
          },
        },
        where: {
          uuid,
        },
      });

      if (!problem) {
        throw new NotFoundException('문제를 찾을 수 없습니다.');
      }

      return {
        ...problem,
      };
    } catch (e) {
      this.logger.error(`${ProblemsService.name} getProblem uuid`, {
        message: e.message,
      });

      throw e;
    }
  }
}

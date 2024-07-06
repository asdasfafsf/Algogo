import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from 'winston';
import { RequestProblemSummaryDto } from '@libs/core/dto/RequestProblemSummaryDto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ProblemsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly prismaService: PrismaService,
  ) {}

  async getProblemSummaryList(
    requestProblemSummaryDto: RequestProblemSummaryDto,
  ) {
    const { pageNo, pageSize, typeList, levelList } = requestProblemSummaryDto;

    try {
      const problemSummaryList = await this.prismaService.problem.findMany({
        select: {
          no: false,
          uuid: true,
          title: true,
          levelText: true,
          answerCount: true,
          submitCount: true,
          answerPeopleCount: true,
          source: true,
          sourceId: true,
          sourceUrl: true,
          level: true,
          typeList: true,
        },
        where: {
          ...(typeList && typeList.length > 0
            ? { typeList: { some: { name: { in: typeList } } } }
            : {}),
          ...(levelList && levelList.length > 0
            ? { level: { in: levelList } }
            : {}),
        },
        skip: (pageNo - 1) * pageSize,
        take: pageSize,
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

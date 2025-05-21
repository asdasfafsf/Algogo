import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { Prisma } from '@prisma/client';
import { ProblemSort } from './types/problem.type';
import { PROBLEM_SORT_MAP } from './constants/problems-sort';
@Injectable()
export class ProblemsV2Repository {
  constructor(private readonly prismaService: PrismaService) {}

  private getProblemOrderBy(
    sort: ProblemSort,
  ):
    | Prisma.ProblemOrderByWithRelationInput
    | Prisma.ProblemOrderByWithRelationInput[] {
    const orderBy = [];

    if (sort === PROBLEM_SORT_MAP.ANSWER_RATE_ASC) {
      orderBy.push({
        answerRate: 'asc',
      });
    } else if (sort === PROBLEM_SORT_MAP.ANSWER_RATE_DESC) {
      orderBy.push({
        answerRate: 'desc',
      });
    } else if (sort === PROBLEM_SORT_MAP.LEVEL_ASC) {
      orderBy.push({
        level: 'asc',
      });
    } else if (sort === PROBLEM_SORT_MAP.LEVEL_DESC) {
      orderBy.push({
        level: 'desc',
      });
    } else if (sort === PROBLEM_SORT_MAP.SUBMIT_COUNT_ASC) {
      orderBy.push({
        submitCount: 'asc',
      });
    } else if (sort === PROBLEM_SORT_MAP.SUBMIT_COUNT_DESC) {
      orderBy.push({
        submitCount: 'desc',
      });
    } else if (sort === PROBLEM_SORT_MAP.TITLE_ASC) {
      orderBy.push({
        title: 'asc',
      });
    } else if (sort === PROBLEM_SORT_MAP.TITLE_DESC) {
      orderBy.push({
        title: 'desc',
      });
    }

    return orderBy;
  }

  async getProblemsSummary(dto: InquiryProblemsSummaryDto) {
    const { pageNo, pageSize, sort, levelList, typeList } = dto;

    const where: Prisma.ProblemV2WhereInput = {};

    if (levelList) {
      where.level = { in: levelList };
    }

    if (typeList) {
      where.typeList = { some: { name: { in: typeList } } };
    }

    const orderBy = this.getProblemOrderBy(sort);
    const skip = (pageNo - 1) * pageSize;
    const take = pageSize;

    const totalCount = await this.prismaService.problemV2.count({
      where,
    });
    const problemList = await this.prismaService.problemV2.findMany({
      select: {
        no: false,
        uuid: true,
        title: true,
        level: true,
        levelText: true,
        answerRate: true,
        submitCount: true,
        answerCount: true,
        answerPeopleCount: true,
        source: true,
        sourceId: true,
        sourceUrl: true,
      },
      where,
      orderBy,
      skip,
      take,
    });

    return {
      problemList,
      totalCount,
      pageSize,
      pageNo,
    };
  }

  async getProblem(uuid: string) {
    return this.prismaService.problemV2.findUnique({
      select: {
        no: false,
        uuid: true,
        title: true,
        level: true,
        levelText: true,
        answerRate: true,
        submitCount: true,
        answerCount: true,
        answerPeopleCount: true,
        source: true,
        sourceId: true,
        sourceUrl: true,
        content: true,
        limit: true,
        hint: true,
        subTask: true,
        input: true,
        output: true,
        protocol: true,
        etc: true,
        additionalTimeAllowed: true,
        isSpecialJudge: true,
        isSubTask: true,
        isFunction: true,
        isInteractive: true,
        isTwoStep: true,
        isClass: true,
        style: true,
        timeout: true,
        memoryLimit: true,
        createdAt: true,
        updatedAt: true,
        typeList: {
          select: {
            name: true,
          },
        },
        inputOutputList: {
          select: {
            order: true,
            content: true,
            input: true,
            output: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        subTaskList: {
          select: {
            order: true,
            title: true,
            content: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        customExample: true,
        customImplementation: true,
        customGrader: true,
        customNotes: true,
        customAttachment: true,
        problemSource: true,
      },
      where: {
        uuid,
      },
    });
  }
}

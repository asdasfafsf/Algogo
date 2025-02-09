import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProblemType } from '../common/enums/ProblemTypeEnum';
import { ProblemSort } from './enum/ProblemSortEnum';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProblemsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private getProblemOrderBy(
    sort: ProblemSort,
  ):
    | Prisma.ProblemOrderByWithRelationInput
    | Prisma.ProblemOrderByWithRelationInput[] {
    const orderBy = [];

    if (sort === ProblemSort.ANSWER_RATE_ASC) {
      orderBy.push({
        answerRate: 'asc',
      });
    } else if (sort === ProblemSort.ANSWER_RATE_DESC) {
      orderBy.push({
        answerRate: 'desc',
      });
    } else if (sort === ProblemSort.LEVEL_ASC) {
      orderBy.push({
        level: 'asc',
      });
    } else if (sort === ProblemSort.LEVEL_DESC) {
      orderBy.push({
        level: 'desc',
      });
    } else if (sort === ProblemSort.SUBMIT_COUNT_ASC) {
      orderBy.push({
        submitCount: 'asc',
      });
    } else if (sort === ProblemSort.SUBMIT_COUNT_DESC) {
      orderBy.push({
        submitCount: 'desc',
      });
    } else if (sort === ProblemSort.TITLE_ASC) {
      orderBy.push({
        title: 'asc',
      });
    } else if (sort === ProblemSort.TITLE_DESC) {
      orderBy.push({
        title: 'desc',
      });
    }

    return orderBy;
  }
  async getProblemList(
    pageNo: number,
    pageSize: number,
    sort: ProblemSort,
    levelList?: number[],
    typeList?: ProblemType[],
    title?: string,
  ) {
    const orderBy = this.getProblemOrderBy(sort);

    const totalCount = await this.prismaService.problem.count({
      where: {
        ...(typeList && typeList.length > 0
          ? { typeList: { some: { name: { in: typeList } } } }
          : {}),
        ...(levelList && levelList.length > 0
          ? { level: { in: levelList } }
          : {}),
        ...(title ? { title: { contains: title } } : null),
      },
      orderBy,
    });

    const problemSummaryList = await this.prismaService.problem.findMany({
      select: {
        no: false,
        uuid: true,
        title: true,
        levelText: true,
        answerCount: true,
        submitCount: true,
        answerRate: true,
        answerPeopleCount: true,
        source: true,
        sourceId: true,
        sourceUrl: true,
        level: true,
        typeList: true,
      },
      where: {
        ...(title ? { title: { contains: title } } : null),
        ...(typeList && typeList.length > 0
          ? { typeList: { some: { name: { in: typeList } } } }
          : {}),
        ...(levelList && levelList.length > 0
          ? { level: { in: levelList } }
          : {}),
      },
      orderBy,
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
    });

    return {
      problemList: problemSummaryList,
      totalCount,
      pageSize,
      pageNo,
    };
  }

  async getProblemListFromTitle(
    pageNo: number,
    pageSize: number,
    sort: ProblemSort,
    title: string,
  ) {
    const totalCount = await this.prismaService.problem.count({
      where: {
        title: {
          contains: title,
        },
      },
    });

    const orderBy = this.getProblemOrderBy(sort);

    const problemSummaryList = await this.prismaService.problem.findMany({
      select: {
        no: false,
        uuid: true,
        title: true,
        levelText: true,
        answerCount: true,
        submitCount: true,
        answerRate: true,
        answerPeopleCount: true,
        source: true,
        sourceId: true,
        sourceUrl: true,
        level: true,
        typeList: true,
      },
      where: {
        title: {
          contains: title,
        },
      },
      orderBy,
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
    });

    return {
      problemList: problemSummaryList,
      totalCount,
      pageSize,
      pageNo,
    };
  }

  async getProblem(uuid: string) {
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
        answerRate: true,
        answerPeopleCount: true,
        submitCount: true,
        timeout: true,
        memoryLimit: true,
        source: true,
        sourceId: true,
        sourceUrl: true,
        updatedAt: true,
        contentList: {
          select: {
            order: true,
            type: true,
            content: true,
            cellList: true,
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

    return problem;
  }
}

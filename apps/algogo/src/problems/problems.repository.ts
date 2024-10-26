import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProblemType } from '../common/enums/ProblemTypeEnum';

@Injectable()
export class ProblemsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProblemList(
    pageNo: number,
    pageSize: number,
    levelList?: number[],
    typeList?: ProblemType[],
  ) {
    const totalCount = await this.prismaService.problem.count({
      where: {
        ...(typeList && typeList.length > 0
          ? { typeList: { some: { name: { in: typeList } } } }
          : {}),
        ...(levelList && levelList.length > 0
          ? { level: { in: levelList } }
          : {}),
      },
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
    problemTitle: string,
  ) {
    const totalCount = await this.prismaService.problem.count({
      where: {
        title: {
          contains: problemTitle,
        },
      },
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
        title: {
          contains: problemTitle,
        },
      },
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

    return problem;
  }
}

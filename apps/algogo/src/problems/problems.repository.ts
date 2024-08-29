import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProblemList(
    pageNo: number,
    pageSize: number,
    levelList: number[],
    typeList: string[],
  ) {
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

    return problemSummaryList;
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

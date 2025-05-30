import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { Prisma } from '@prisma/client';
import { ProblemSort } from './types/problem.type';
import { PROBLEM_SORT_MAP } from './constants/problems-sort';
import { ProblemSummaryDto } from './dto/problem-summary.dto';
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

  async getProblemSumamryByTitle(dto: InquiryProblemsSummaryDto) {
    const { pageNo, pageSize, sort, levelList, typeList, title } = dto;

    const filters: string[] = [];

    if (levelList?.length) {
      filters.push(
        `p.PROBLEM_V2_LEVEL IN (${levelList.map(Number).join(',')})`,
      );
    }

    if (typeList?.length) {
      filters.push(`
        EXISTS (
          SELECT 1 FROM PROBLEM_V2_TYPE t
          WHERE t.PROBLEM_V2_UUID = p.PROBLEM_V2_UUID
          AND t.name IN (${typeList.map((v) => `'${v}'`).join(',')})
        )
      `);
    }

    const whereClause = filters.length ? `AND ${filters.join(' AND ')}` : '';

    const orderClause = (() => {
      switch (sort) {
        case PROBLEM_SORT_MAP.ANSWER_RATE_DESC:
          return 'ORDER BY p.PROBLEM_V2_ANSWER_RATE DESC';
        case PROBLEM_SORT_MAP.ANSWER_RATE_ASC:
          return 'ORDER BY p.PROBLEM_V2_ANSWER_RATE ASC';
        case PROBLEM_SORT_MAP.LEVEL_ASC:
          return 'ORDER BY p.PROBLEM_V2_LEVEL ASC';
        case PROBLEM_SORT_MAP.LEVEL_DESC:
          return 'ORDER BY p.PROBLEM_V2_LEVEL DESC';
        case PROBLEM_SORT_MAP.SUBMIT_COUNT_ASC:
          return 'ORDER BY p.PROBLEM_V2_SUBMIT_COUNT ASC';
        case PROBLEM_SORT_MAP.SUBMIT_COUNT_DESC:
          return 'ORDER BY p.PROBLEM_V2_SUBMIT_COUNT DESC';
        case PROBLEM_SORT_MAP.TITLE_ASC:
          return 'ORDER BY p.PROBLEM_V2_TITLE ASC';
        case PROBLEM_SORT_MAP.TITLE_DESC:
          return 'ORDER BY p.PROBLEM_V2_TITLE DESC';
        default:
          return 'ORDER BY p.PROBLEM_V2_NO ASC';
      }
    })();

    const rawList = await this.prismaService.$queryRaw<ProblemSummaryDto[]>(
      Prisma.sql`
      SELECT
        p.PROBLEM_V2_UUID AS uuid,
        p.PROBLEM_V2_TITLE AS title,
        p.PROBLEM_V2_LEVEL AS level,
        p.PROBLEM_V2_LEVEL_TEXT AS levelText,
        p.PROBLEM_V2_ANSWER_RATE AS answerRate,
        p.PROBLEM_V2_SUBMIT_COUNT AS submitCount,
        p.PROBLEM_V2_ANSWER_COUNT AS answerCount,
        p.PROBLEM_V2_ANSWER_PEOPLE_COUNT AS answerPeopleCount,
        p.PROBLEM_V2_SOURCE AS source,
        p.PROBLEM_V2_SOURCE_ID AS sourceId,
        p.PROBLEM_V2_SOURCE_URL AS sourceUrl
      FROM PROBLEM_V2 p
      WHERE MATCH(p.PROBLEM_V2_TITLE) AGAINST(${title} IN BOOLEAN MODE)
      ${Prisma.raw(whereClause)}
      ${Prisma.raw(orderClause)}
      LIMIT 1000;
    `,
    );
    const filtered = (rawList as ProblemSummaryDto[]).filter((item) =>
      item.title.includes(title),
    );
    const totalCount = filtered.length;
    const offset = (pageNo - 1) * pageSize;
    const paged = filtered.slice(offset, offset + pageSize);

    return {
      problemList: paged,
      totalCount,
      pageSize,
      pageNo,
    };
  }
  async getProblemsSummary(dto: InquiryProblemsSummaryDto) {
    const { pageNo, pageSize, sort, levelList, typeList, title } = dto;

    const where: Prisma.ProblemV2WhereInput = {};

    if (levelList) {
      where.level = { in: levelList };
    }

    if (typeList) {
      where.typeList = { some: { name: { in: typeList } } };
    }

    if (title) {
      where.title = { contains: title };
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
        isLanguageRestrict: true,
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
        languageLimitList: {
          select: {
            language: true,
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
        customSample: true,
      },
      where: {
        uuid,
      },
    });
  }
}

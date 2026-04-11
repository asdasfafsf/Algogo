import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { Prisma } from '@prisma/client';
import { ProblemSort, PROBLEM_SORT } from '../common/constants/problem-sort.constant';
import { getProblemOrderBy } from '../common/utils/problem-order-by.util';
import { ProblemSummaryDto } from './dto/problem-summary.dto';
import { USER_PROBLEM_STATE } from '../common/constants/user.constant';
import { DEFAULT_PAGE_NO, DEFAULT_PAGE_SIZE, FULLTEXT_SEARCH_LIMIT } from '../common/constants/pagination.constant';
import { UserProblemState } from '../common/types/user.type';

@Injectable()
export class ProblemsV2Repository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProblemSummaryByTitle(
    dto: InquiryProblemsSummaryDto & { userUuid?: string },
  ) {
    const { pageNo, pageSize, sort, levelList, typeList, title, states } = dto;

    const filters: Prisma.Sql[] = [];

    if (levelList?.length) {
      filters.push(
        Prisma.sql`p.PROBLEM_V2_LEVEL IN (${Prisma.join(levelList.map(Number))})`,
      );
    }

    if (typeList?.length) {
      filters.push(Prisma.sql`
        EXISTS (
          SELECT 1 FROM PROBLEM_V2_TYPE t
          WHERE t.PROBLEM_V2_UUID = p.PROBLEM_V2_UUID
          AND t.name IN (${Prisma.join(typeList)})
        )
      `);
    }

    // states 필터링: states.length == 0일 때는 전체, 필터가 있을 때는 해당 상태만
    if (states && states.length > 0 && dto.userUuid) {
      // NONE과 NULL을 동일하게 처리
      const hasNoneState = states.includes(USER_PROBLEM_STATE.NONE);
      const otherStates = states.filter((state) => state !== USER_PROBLEM_STATE.NONE);

      if (hasNoneState && otherStates.length > 0) {
        // NONE과 다른 상태들이 모두 포함된 경우
        filters.push(Prisma.sql`
          (NOT EXISTS (
            SELECT 1 FROM USER_PROBLEM_STATE ups2
            WHERE ups2.PROBLEM_UUID = p.PROBLEM_V2_UUID
            AND ups2.USER_UUID = ${dto.userUuid}
          ) OR EXISTS (
            SELECT 1 FROM USER_PROBLEM_STATE ups2
            WHERE ups2.PROBLEM_UUID = p.PROBLEM_V2_UUID
            AND ups2.USER_UUID = ${dto.userUuid}
            AND ups2.STATE IN (${Prisma.join(otherStates)})
          ))
        `);
      } else if (hasNoneState) {
        // NONE만 포함된 경우 (상태가 없는 문제들)
        filters.push(Prisma.sql`
          NOT EXISTS (
            SELECT 1 FROM USER_PROBLEM_STATE ups2
            WHERE ups2.PROBLEM_UUID = p.PROBLEM_V2_UUID
            AND ups2.USER_UUID = ${dto.userUuid}
          )
        `);
      } else {
        // 다른 상태들만 포함된 경우
        filters.push(Prisma.sql`
          EXISTS (
            SELECT 1 FROM USER_PROBLEM_STATE ups2
            WHERE ups2.PROBLEM_UUID = p.PROBLEM_V2_UUID
            AND ups2.USER_UUID = ${dto.userUuid}
            AND ups2.STATE IN (${Prisma.join(otherStates)})
          )
        `);
      }
    }

    const whereClause =
      filters.length > 0
        ? Prisma.sql`AND ${Prisma.join(filters, ' AND ')}`
        : Prisma.empty;

    const orderClause = (() => {
      switch (sort) {
        case PROBLEM_SORT.ANSWER_RATE_DESC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_ANSWER_RATE DESC`;
        case PROBLEM_SORT.ANSWER_RATE_ASC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_ANSWER_RATE ASC`;
        case PROBLEM_SORT.LEVEL_ASC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_LEVEL ASC`;
        case PROBLEM_SORT.LEVEL_DESC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_LEVEL DESC`;
        case PROBLEM_SORT.SUBMIT_COUNT_ASC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_SUBMIT_COUNT ASC`;
        case PROBLEM_SORT.SUBMIT_COUNT_DESC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_SUBMIT_COUNT DESC`;
        case PROBLEM_SORT.TITLE_ASC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_TITLE ASC`;
        case PROBLEM_SORT.TITLE_DESC:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_TITLE DESC`;
        default:
          return Prisma.sql`ORDER BY p.PROBLEM_V2_NO ASC`;
      }
    })();

    const stateSelectClause = dto.userUuid
      ? Prisma.sql`COALESCE(ups.STATE, 'NONE') AS state`
      : Prisma.sql`'NONE' AS state`;

    const joinClause = dto.userUuid
      ? Prisma.sql`LEFT JOIN USER_PROBLEM_STATE ups ON ups.PROBLEM_UUID = p.PROBLEM_V2_UUID AND ups.USER_UUID = ${dto.userUuid}`
      : Prisma.empty;

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
          p.PROBLEM_V2_SOURCE_URL AS sourceUrl,
          ${stateSelectClause}
        FROM PROBLEM_V2 p
        ${joinClause}
        WHERE MATCH(p.PROBLEM_V2_TITLE) AGAINST(${title} IN BOOLEAN MODE)
        ${whereClause}
        ${orderClause}
        LIMIT ${FULLTEXT_SEARCH_LIMIT};
      `,
    );

    const searchTitle = dto.title ?? '';
    const filtered = (rawList as ProblemSummaryDto[]).filter((item) => {
      const title = item.title.toLowerCase();
      const search = searchTitle.toLowerCase();

      return title.includes(search);
    });
    const totalCount = filtered.length;
    const currentPageNo = pageNo ?? DEFAULT_PAGE_NO;
    const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE;
    const offset = (currentPageNo - 1) * currentPageSize;
    const paged = filtered.slice(offset, offset + currentPageSize);

    return {
      problemList: paged,
      totalCount,
      pageSize,
      pageNo,
    };
  }

  async getProblemsSummary(
    dto: InquiryProblemsSummaryDto & { userUuid?: string },
  ) {
    const { pageNo, pageSize, sort, levelList, typeList, title, states } = dto;

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

    // states 필터링: states.length == 0일 때는 전체, 필터가 있을 때는 해당 상태만
    if (states && states.length > 0 && dto.userUuid) {
      // NONE과 NULL을 동일하게 처리
      const hasNoneState = states.includes(USER_PROBLEM_STATE.NONE);
      const otherStates = states.filter((state) => state !== USER_PROBLEM_STATE.NONE);

      if (hasNoneState && otherStates.length > 0) {
        // NONE과 다른 상태들이 모두 포함된 경우
        where.OR = [
          {
            userProblemStateList: {
              none: {
                userUuid: dto.userUuid,
              },
            },
          },
          {
            userProblemStateList: {
              some: {
                userUuid: dto.userUuid,
                state: { in: otherStates },
              },
            },
          },
        ];
      } else if (hasNoneState) {
        // NONE만 포함된 경우 (상태가 없는 문제들)
        where.userProblemStateList = {
          none: {
            userUuid: dto.userUuid,
          },
        };
      } else {
        // 다른 상태들만 포함된 경우
        where.userProblemStateList = {
          some: {
            userUuid: dto.userUuid,
            state: { in: otherStates },
          },
        };
      }
    }

    const orderBy = getProblemOrderBy(sort);
    const skip = ((pageNo ?? DEFAULT_PAGE_NO) - 1) * (pageSize ?? DEFAULT_PAGE_SIZE);
    const take = pageSize ?? DEFAULT_PAGE_SIZE;

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
        userProblemStateList: dto.userUuid
          ? {
              select: {
                state: true,
              },
              where: {
                userUuid: dto.userUuid,
              },
            }
          : undefined,
      },
      where,
      orderBy,
      skip,
      take,
    });

    const mappedProblemList = problemList.map((problem) => ({
      ...problem,
      state: (problem.userProblemStateList?.[0]?.state ??
        USER_PROBLEM_STATE.NONE) as UserProblemState,
      userProblemStateList: undefined,
    }));

    return {
      problemList: mappedProblemList,
      totalCount,
      pageSize,
      pageNo,
    };
  }

  async getProblem({ uuid, userUuid }: { uuid: string; userUuid?: string }) {
    const problem = await this.prismaService.problemV2.findUnique({
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
        userProblemStateList: userUuid
          ? {
              select: {
                state: true,
              },
              where: {
                userUuid,
              },
            }
          : false,
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

    return problem;
  }

  async getTodayProblems({
    startDate,
    endDate,
    userUuid,
  }: {
    startDate: Date;
    endDate: Date;
    userUuid?: string;
  }) {
    const todayProblems = await this.prismaService.todayProblem.findMany({
      select: {
        problemUuid: true,
        problemV2: {
          select: {
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
            typeList: {
              select: {
                name: true,
              },
            },
            userProblemStateList: userUuid
              ? {
                  select: {
                    state: true,
                  },
                  where: {
                    userUuid,
                  },
                }
              : false,
          },
        },
      },
      where: {
        servedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const mappedTodayProblems = todayProblems.map((todayProblem) => ({
      ...todayProblem.problemV2,
      userProblemStateList: undefined,
      uuid: todayProblem.problemUuid,
      typeList: todayProblem.problemV2.typeList.map((type) => type.name),
      state: (todayProblem.problemV2.userProblemStateList?.[0]?.state ??
        USER_PROBLEM_STATE.NONE) as UserProblemState,
    }));

    return mappedTodayProblems;
  }
}

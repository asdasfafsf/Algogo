import { Injectable } from '@nestjs/common';
import { ProblemsV2Repository } from './problems-v2.repository';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { CustomNotFoundException } from '../common/errors/CustomNotFoundException';
import { ProblemDto } from './dto/problem.dto';
import { TodayProblemDto } from './dto/today-problem.dto';
import { UserProblemState } from '../common/types/user.type';
import { ProblemType } from './types/problem.type';
import { USER_PROBLEM_STATE } from '../common/constants/user.constant';

@Injectable()
export class ProblemsV2Service {
  constructor(private readonly problemsV2Repository: ProblemsV2Repository) {}

  async getProblemsSummary(
    dto: InquiryProblemsSummaryDto & { userUuid?: string },
  ) {
    const MYSQL_FULLTEXT_DELIMITERS = ['+', '-', '<', '>', '@', '~', '*'];

    const hasTitle = !!dto.title;
    const hasSpecial = MYSQL_FULLTEXT_DELIMITERS.some((delimiter) =>
      dto.title.includes(delimiter),
    );
    const canNgramSearch = hasTitle && dto.title.length > 1 && !hasSpecial;

    if (canNgramSearch) {
      return this.problemsV2Repository.getProblemSumamryByTitle(dto);
    }

    return this.problemsV2Repository.getProblemsSummary(dto);
  }

  async getProblem(dto: {
    uuid: string;
    userUuid?: string;
  }): Promise<ProblemDto> {
    const problem = await this.problemsV2Repository.getProblem(dto);

    if (!problem) {
      throw new CustomNotFoundException({
        code: 'PROBLEM_NOT_FOUND',
        message: '존재하지 않는 문제입니다',
      });
    }

    return {
      ...problem,
      state: (problem.userProblemStateList?.[0]?.state ??
        USER_PROBLEM_STATE.NONE) as UserProblemState,
      typeList: problem.typeList.map(
        (type) => type.name as ProblemType,
      ) as ProblemType[],
      languageLimitList: problem.languageLimitList.map(
        (languageLimit) => languageLimit.language,
      ),
    };
  }

  async getTodayProblems({
    userUuid,
    addDays,
  }: {
    userUuid?: string;
    addDays: number;
  }): Promise<TodayProblemDto[]> {
    const servedAt = new Date();
    const startDate = new Date(servedAt.setDate(servedAt.getDate() + addDays));
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(
      servedAt.setDate(servedAt.getDate() + addDays + 1),
    );
    endDate.setHours(0, 0, 0, 0);

    const todayProblems = await this.problemsV2Repository.getTodayProblems({
      startDate,
      endDate,
      userUuid,
    });

    return todayProblems.map((todayProblem) => ({
      ...todayProblem,
      userProblemStateList: undefined,
      difficulty:
        ['입문', '초급', '중급', '고급', '심화'][
          Math.floor(todayProblem.level / 4)
        ] ?? '알 수 없음',
    }));
  }
}

import { Injectable } from '@nestjs/common';
import { ProblemsV2Repository } from './problems-v2.repository';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { CustomNotFoundException } from '../common/errors/CustomNotFoundException';
import { ProblemDto } from './dto/problem.dto';
import { ProblemType } from './types/problem.type';

@Injectable()
export class ProblemsV2Service {
  constructor(private readonly problemsV2Repository: ProblemsV2Repository) {}

  async getProblemsSummary(dto: InquiryProblemsSummaryDto) {
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

  async getProblem(uuid: string): Promise<ProblemDto> {
    const problem = await this.problemsV2Repository.getProblem(uuid);

    if (!problem) {
      throw new CustomNotFoundException({
        code: 'PROBLEM_NOT_FOUND',
        message: '존재하지 않는 문제입니다',
      });
    }

    return {
      ...problem,
      typeList: problem.typeList.map((type) => type.name as ProblemType),
      languageLimitList: problem.languageLimitList.map(
        (languageLimit) => languageLimit.language,
      ),
      subTaskList: problem.subTaskList.map((subTask) => ({
        order: subTask.order,
        title: subTask.title,
        content: subTask.content,
      })),
    };
  }
}

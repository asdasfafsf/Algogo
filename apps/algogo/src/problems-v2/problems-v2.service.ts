import { Injectable } from '@nestjs/common';
import { ProblemsV2Repository } from './problems-v2.repository';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { CustomNotFoundException } from '../common/errors/CustomNotFoundException';

@Injectable()
export class ProblemsV2Service {
  constructor(private readonly problemsV2Repository: ProblemsV2Repository) {}

  async getProblemsSummary(dto: InquiryProblemsSummaryDto) {
    return this.problemsV2Repository.getProblemsSummary(dto);
  }

  async getProblem(uuid: string) {
    const problem = await this.problemsV2Repository.getProblem(uuid);

    if (!problem) {
      throw new CustomNotFoundException({
        code: 'PROBLEM_NOT_FOUND',
        message: '존재하지 않는 문제입니다',
      });
    }

    return problem;
  }
}

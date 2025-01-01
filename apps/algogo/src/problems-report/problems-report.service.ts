import { Injectable, NotFoundException } from '@nestjs/common';
import ProblemReportDto from './dto/ProblemReportDto';
import { ProblemsReportRepository } from './problems-report.repository';

@Injectable()
export class ProblemsReportService {
  constructor(
    private readonly problemsReportRepository: ProblemsReportRepository,
  ) {}
  async reportProblem(problemReportDto: ProblemReportDto) {
    const { problemUuid } = problemReportDto;
    const problem =
      await this.problemsReportRepository.getProblemNo(problemUuid);

    if (!problem) {
      throw new NotFoundException('해당하는 문제가 없습니다.');
    }

    const problemNo = problem.no;
    const dto = { ...problemReportDto, problemNo };
    await this.problemsReportRepository.insertProblemsReport(dto);
  }
}

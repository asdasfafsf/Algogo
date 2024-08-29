import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from 'winston';
import { RequestProblemSummaryListDto } from '@libs/core/dto/RequestProblemSummaryListDto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ProblemsRepository } from './problems.repository';

@Injectable()
export class ProblemsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly problemsRepository: ProblemsRepository,
  ) {}

  async getProblemSummaryList(
    requestProblemSummaryDto: RequestProblemSummaryListDto,
  ) {
    const { pageNo, pageSize, typeList, levelList } = requestProblemSummaryDto;

    try {
      const problemSummaryList = await this.problemsRepository.getProblemList(
        pageNo,
        pageSize,
        levelList,
        typeList,
      );

      return problemSummaryList.map((summary) => {
        return {
          ...summary,
          key: summary.source,
        };
      });
    } catch (e) {
      this.logger.error(`${ProblemsService.name} getProblemSummaryList`, {
        message: e.message,
      });

      throw e;
    }
  }

  async getProblem(uuid: string) {
    try {
      const problem = await this.problemsRepository.getProblem(uuid);

      if (!problem) {
        throw new NotFoundException('문제를 찾을 수 없습니다.');
      }

      return problem;
    } catch (e) {
      this.logger.error(`${ProblemsService.name} getProblem uuid`, {
        message: e.message,
      });

      throw e;
    }
  }
}

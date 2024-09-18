import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestProblemSummaryListDto } from '@libs/core/dto/RequestProblemSummaryListDto';
import { ProblemsRepository } from './problems.repository';
import { ResponseProblemSummaryDto } from './dto/ResponseProblemSummaryDto';
import { ProblemType } from '../common/enums/ProblemTypeEnum';
import { ResponseProblemDto } from './dto/ResponseProblemDto';
import { ResponseProblemContentDto } from './dto/ResponseProblemContentDto';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class ProblemsService {
  constructor(
    private readonly logger: CustomLogger,
    private readonly problemsRepository: ProblemsRepository,
  ) {}

  async getProblemSummaryList(
    requestProblemSummaryDto: RequestProblemSummaryListDto,
  ): Promise<ResponseProblemSummaryDto[]> {
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
          typeList: summary.typeList.map((elem) => elem.name as ProblemType),
        };
      });
    } catch (e) {
      this.logger.error(`${ProblemsService.name} getProblemSummaryList`, {
        message: e.message,
      });

      throw e;
    }
  }

  async getProblem(uuid: string): Promise<ResponseProblemDto> {
    try {
      const problem = await this.problemsRepository.getProblem(uuid);

      if (!problem) {
        throw new NotFoundException('문제를 찾을 수 없습니다.');
      }

      return {
        ...problem,
        contentList: problem?.contentList?.map(
          (content) => content as ResponseProblemContentDto,
        ),
      };
    } catch (e) {
      this.logger.error(`${ProblemsService.name} getProblem uuid`, {
        message: e.message,
      });

      throw e;
    }
  }
}

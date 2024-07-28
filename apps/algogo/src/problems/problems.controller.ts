import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsCollectService } from './problems-collect.service';
import { RequestProblemSummaryListDto } from '@libs/core/dto/RequestProblemSummaryListDto';

@Controller('api/v1/problems')
export class ProblemsController {
  constructor(
    private readonly problemsCollectService: ProblemsCollectService,
    private readonly problemsService: ProblemsService,
  ) {}

  @Get('/')
  async getProblemList(
    @Query() requestProblemSummaryDto: RequestProblemSummaryListDto,
  ) {
    return await this.problemsService.getProblemSummaryList(
      requestProblemSummaryDto,
    );
  }

  @Get('/:problemUuid')
  async getProblem(@Param('problemUuid') uuid: string) {
    return await this.problemsService.getProblem(uuid);
  }

  @Get('/collect/:site/:key')
  async collectProblem(@Param('site') site: string, @Param('key') key: string) {
    const res = await this.problemsCollectService.collectProblem(site, key);
    return res;
  }
}

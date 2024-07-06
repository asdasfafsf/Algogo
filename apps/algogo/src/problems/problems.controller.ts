import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsCollectService } from './problems-collect.service';

@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly problemsCollectService: ProblemsCollectService,
    private readonly problemsService: ProblemsService,
  ) {}

  @Get('/')
  async getProblemSummary(
    @Query('typeList') typeList: string[],
    @Query('levelList') levelList: number[],
    @Query('pageNo') pageNo: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.problemsService.getProblemSummaryList();
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

import { Controller, Get, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get('/collect/:site/:key')
  async collectProblem(@Query('site') site: string, @Query('key') key: string) {
    const res = await this.problemsService.collectProblem(site, key);
    return res;
  }
}

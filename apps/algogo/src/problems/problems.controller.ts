import { Controller, Get, Param } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get('/:problemUuid')
  async getProblem(@Param('problemUuid') uuid: string) {
    return await this.problemsService.getProblem(uuid);
  }

  @Get('/collect/:site/:key')
  async collectProblem(@Param('site') site: string, @Param('key') key: string) {
    const res = await this.problemsService.collectProblem(site, key);
    return res;
  }
}

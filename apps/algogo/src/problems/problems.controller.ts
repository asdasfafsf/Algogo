import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsCollectService } from './problems-collect.service';
import { RequestProblemSummaryListDto } from '@libs/core/dto/RequestProblemSummaryListDto';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseProblemSummaryDto } from './dto/ResponseProblemSummaryDto';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';

@ApiTags('문제 관련 API')
@ApiBadRequestErrorResponse()
@Controller('api/v1/problems')
export class ProblemsController {
  constructor(
    private readonly problemsCollectService: ProblemsCollectService,
    private readonly problemsService: ProblemsService,
  ) {}

  @ApiOperation({
    summary: '문제 요약 리스트',
    description: '여러 문제의 요약 정보를 불러온다',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '문제 리스트 조회 성공',
    type: [ResponseProblemSummaryDto],
  })
  @Get('/')
  async getProblemList(
    @Query() requestProblemSummaryDto: RequestProblemSummaryListDto,
  ): Promise<ResponseProblemSummaryDto[]> {
    return await this.problemsService.getProblemSummaryList(
      requestProblemSummaryDto,
    );
  }

  @ApiOperation({
    summary: '문제 상세조회',
    description: '문제에 대한 상세 정보를 가져온다',
  })
  @Get('/:problemUuid')
  async getProblem(@Param('problemUuid') uuid: string) {
    return await this.problemsService.getProblem(uuid);
  }

  @ApiExcludeEndpoint()
  @Get('/collect/:site/:key')
  async collectProblem(@Param('site') site: string, @Param('key') key: string) {
    const res = await this.problemsCollectService.collectProblem(site, key);
    return res;
  }
}

import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { ProblemSummaryDto } from './dto/problem-summary.dto';
import { ProblemDto } from './dto/problem.dto';
import { CommonApiResponse } from '../common/decorators/swagger/CommonApiResponse';
import { ProblemsV2Service } from './problems-v2.service';

@ApiTags('문제 API V2')
@ApiBadRequestErrorResponse()
@Controller('api/v2/problems')
export class ProblemsV2Controller {
  constructor(private readonly problemsV2Service: ProblemsV2Service) {}

  @ApiOperation({
    summary: '문제 요악 리스트',
    description: '여러 문제의 요약 정보를 불러온다',
  })
  @CommonApiResponse({
    status: HttpStatus.OK,
    description: '문제 요약 정보 조회 성공',
    model: ProblemSummaryDto,
    isArray: true,
  })
  @Get('/')
  async getProblems(@Query() query: InquiryProblemsSummaryDto) {
    return this.problemsV2Service.getProblemsSummary(query);
  }

  @ApiOperation({
    summary: '문제 상세 정보',
    description: 'uuid에 해당하는 문제 상세 정보를 불러온다',
  })
  @CommonApiResponse({
    status: HttpStatus.OK,
    description: '문제 상세 정보 조회 성공',
    model: ProblemDto,
    isArray: false,
  })
  @Get('/:problemUuid')
  async getProblem(@Param('problemUuid') uuid: string) {
    return this.problemsV2Service.getProblem(uuid);
  }
}

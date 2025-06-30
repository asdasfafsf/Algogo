import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { ProblemSummaryDto } from './dto/problem-summary.dto';
import { ProblemDto } from './dto/problem.dto';
import { CommonApiResponse } from '../common/decorators/swagger/CommonApiResponse';
import { ProblemsV2Service } from './problems-v2.service';
import { TodayProblemDto } from './dto/today-problem.dto';
import { InquiryTodayProblemsDto } from './dto/inquiry-today-problems.dto';
import { TokenUser } from '../common/types/request.type';
import { User } from '../common/decorators/contexts/user.decorator';
import { DecodeGuard } from '../auth-guard/decode-guard';

@ApiTags('문제 API V2')
@ApiBadRequestErrorResponse()
@Controller('api/v2/problems')
@UseGuards(DecodeGuard)
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
  async getProblems(
    @Query() query: InquiryProblemsSummaryDto,
    @User() user: TokenUser,
  ) {
    return this.problemsV2Service.getProblemsSummary({
      ...query,
      userUuid: user?.sub,
    });
  }

  @ApiOperation({
    summary: '오늘의 문제',
    description: 'UTC 기준 오늘 날짜에 해당하는 추천 문제들을 불러온다',
  })
  @CommonApiResponse({
    status: HttpStatus.OK,
    description: '오늘의 문제 조회 성공',
    model: TodayProblemDto,
    isArray: true,
  })
  @Get('/today')
  @HttpCode(HttpStatus.OK)
  async getTodayProblems(
    @User() user: TokenUser,
    @Query() query: InquiryTodayProblemsDto,
  ) {
    return this.problemsV2Service.getTodayProblems({
      userUuid: user?.sub,
      addDays: query.day || 0,
    });
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
  async getProblem(
    @Param('problemUuid') uuid: string,
    @User() user: TokenUser,
  ) {
    return this.problemsV2Service.getProblem({
      uuid,
      userUuid: user?.sub,
    });
  }
}

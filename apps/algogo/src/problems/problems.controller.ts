import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsCollectService } from './problems-collect.service';
import { RequestProblemSummaryListDto } from '@libs/core/dto/RequestProblemSummaryListDto';
import {
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import { ResponseProblemDto } from './dto/ResponseProblemDto';
import { ResponseProblemSummaryListDto } from './dto/ResponseProblemSummaryListDto';
import { ResponseDto } from '../common/dto/ResponseDto';

@ApiTags('문제 관련 API')
@ApiBadRequestErrorResponse()
@ApiExtraModels(ResponseProblemSummaryListDto, ResponseDto)
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
    type: ResponseDto<ResponseProblemSummaryListDto>,
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(ResponseProblemSummaryListDto) },
          },
        },
      ],
    },
  })
  @Get('/')
  async getProblemList(
    @Query() requestProblemSummaryDto: RequestProblemSummaryListDto,
  ): Promise<ResponseProblemSummaryListDto> {
    return await this.problemsService.getProblemSummaryList(
      requestProblemSummaryDto,
    );
  }

  @ApiOperation({
    summary: '문제 상세조회',
    description: '문제에 대한 상세 정보를 가져온다',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '문제 상세 조회 성공',
    type: ResponseProblemDto,
  })
  @Get('/:problemUuid')
  async getProblem(
    @Param('problemUuid') uuid: string,
  ): Promise<ResponseProblemDto> {
    return await this.problemsService.getProblem(uuid);
  }

  @ApiExcludeEndpoint()
  @Get('/collect/:site/:key')
  async collectProblem(@Param('site') site: string, @Param('key') key: string) {
    const res = await this.problemsCollectService.collectProblem(site, key);
    return res;
  }
}

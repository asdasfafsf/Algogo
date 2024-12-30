import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProblemsReportService } from './problems-report.service';
import RequestProblemReportDto from './dto/RequestProblemReportDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('문제 문의 관련 API')
@ApiBadRequestErrorResponse()
@UseGuards(AuthGuard)
@Controller('api/v1/problems/report')
export class ProblemsReportController {
  constructor(private readonly problemsReportService: ProblemsReportService) {}

  @ApiOperation({
    summary: '문제 잘못된게 있을 경우 수정 API',
    description: '문의내용을 전송한다',
    responses: null,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '생성 완료',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '고유번호에 해당하는 문제번호가 없을 경우',
  })
  @Post('/')
  async report(
    @Req() req: AuthRequest,
    @Body() requestProblemReportDto: RequestProblemReportDto,
  ) {
    const { user } = req;
    return null;
  }
}

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestProblemCollectDto } from './dto/RequestProblemCollectDto';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { ProblemsCollectService } from './problems-collect.service';
import { AuthGuard } from '../auth-guard/auth.guard';

@ApiTags('문제 수집 관련 API')
@ApiBearerAuth('Authorization')
@ApiBadRequestErrorResponse()
@ApiGlobalErrorResponses()
@UseGuards(AuthGuard)
@Controller('api/v1/problems/collect')
export class ProblemsCollectController {
  constructor(
    private readonly problemsCollectService: ProblemsCollectService,
  ) {}

  @ApiOperation({
    summary: '문제 수집하는 서비스',
    description: '최신 문제가 업데이트 되지 않았을 때 사용하는 문제 API',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '해당하는 문제가 없는 경우',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'NOT_FOUND',
        errorMessage: '',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: '문제 요청 횟수를 초과할 경우 ',
    schema: {
      example: {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        errorCode: 'P9997',
        errorMessage: '요청 제한에 도달했습니다.',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '이미 업데이트가 수행되어 업데이트가 불필요 할 경우',
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        errorCode: 'P9998',
        errorMessage:
          '금일 해당 문제의 업데이트가 이미 수행되었습니다. 다음 날 다시 요청해주세요',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '성공했거나 이미 존재할 경우',
    schema: {
      example: {
        statusCode: HttpStatus.OK,
        errorCode: '0000',
        errorMessage: '',
        data: 'uuid for problem',
      },
    },
  })
  @Post('/')
  async collectProblem(
    @Body() requestProblemCollectDto: RequestProblemCollectDto,
    @Req() req: AuthRequest,
  ) {
    const { url } = requestProblemCollectDto;
    const { userNo } = req;

    const uuid = await this.problemsCollectService.collect({
      url,
      userNo,
    });
    return uuid;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CodeService } from './code.service';
import RequestUpsertCodeSettingDto from './dto/RequestUpsertCodeSettingDto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseCodeSettingDto } from './dto/ResponseCodeSettingDto';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import ResponseCodeTemplate from './dto/ResponseCodeTemplate';
import { ResponseCodeTemplateResult } from './dto/ResponseCodeTemplateResult';
import RequestUpsertDefaultCodeTemplateDto from './dto/RequestUpsertDefaultCodeTemplateDto';
import RequestUpsertCodeTemplateDto from './dto/RequestUpdateCodeTemplateDto';
import RequestUpsertProblemCodeDto from './dto/RequestUpsertProblemCodeDto';
import RequestCreateCodeTemplateDto from './dto/RequestCreateCodeTemplateDto';
import { ResponseDeleteCodeTemplateDto } from './dto/ResponseDeleteCodeTemplateDto';
import { ResponseProblemCodeDto } from './dto/ResponseProblemCodeDto';
import { ResponseDto } from '../common/dto/ResponseDto';
import { AuthGuard } from '../auth-guard/auth.guard';
import { User } from '../common/decorators/contexts/user.decorator';
import { TokenUser } from '../common/types/request.type';

@ApiGlobalErrorResponses()
@ApiBadRequestErrorResponse()
@ApiTags('Code API')
@ApiBearerAuth('Authorization')
@UseGuards(AuthGuard)
@Controller('api/v1/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @ApiOperation({
    summary: '코드 설정 조회',
    description: '사용자의 코드 에디터 설정을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '코드 설정 조회 성공',
    type: ResponseCodeSettingDto,
  })
  @ApiResponse({
    status: 404,
    description: '코드 설정을 찾을 수 없음',
  })
  @Get('/setting')
  async getCodeSetting(@User() user: TokenUser) {
    const codeSetting = await this.codeService.getCodeSetting(user.sub);
    return codeSetting;
  }

  @ApiOperation({
    summary: '코드 설정 업데이트',
    description: '사용자의 코드 에디터 설정을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '코드 설정 업데이트 성공',
  })
  @Put('/setting')
  async updateCodeSetting(
    @Body() requestUpsertCodeSettingDto: RequestUpsertCodeSettingDto,
    @User() user: TokenUser,
  ) {
    const { sub } = user;
    const dto = { userUuid: sub, ...requestUpsertCodeSettingDto };
    await this.codeService.upsertCodeSetting(dto);
    return null;
  }

  @ApiOperation({
    summary: '코드 템플릿 목록 조회',
    description: '사용자의 코드 템플릿 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '코드 템플릿 목록 조회 성공',
    type: ResponseCodeTemplateResult,
  })
  @Get('/template')
  async getTemplateResult(@User() user: TokenUser) {
    const { sub } = user;
    const { defaultList, summaryList } =
      await this.codeService.getCodeTemplateResult(sub);
    return { defaultList, summaryList };
  }

  @ApiOperation({
    summary: '코드 템플릿 조회',
    description: '특정 코드 템플릿을 조회합니다.',
  })
  @ApiParam({
    name: 'uuid',
    description: '템플릿의 고유 식별자',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '코드 템플릿 조회 성공',
    type: ResponseCodeTemplate,
  })
  @ApiResponse({
    status: 404,
    description: '코드 템플릿을 찾을 수 없음',
  })
  @Get('/template/:uuid')
  async getTemplate(@Param('uuid') uuid: string, @User() user: TokenUser) {
    const { sub } = user;
    const dto = { userUuid: sub, uuid };
    return await this.codeService.getCodeTemplate(dto);
  }

  @ApiOperation({
    summary: '기본 템플릿 설정',
    description: '사용자의 기본 코드 템플릿을 설정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '기본 템플릿 설정 성공',
  })
  @Put('/template/default')
  async setDefaultTemplate(
    @Body() body: RequestUpsertDefaultCodeTemplateDto,
    @User() user: TokenUser,
  ) {
    const { sub } = user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dto = { userUuid: sub, ...body };
    return null;
  }

  @ApiOperation({
    summary: '코드 템플릿 생성',
    description: '코드 템플릿을 생성합니다. 최대 10개까지 생성 가능',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '10개를 넘을 경우 오류 발생',
  })
  @HttpCode(200)
  @Post('/template')
  async createTemplate(
    @Body() body: RequestCreateCodeTemplateDto,
    @User() user: TokenUser,
  ) {
    const { sub } = user;
    const dto = { userUuid: sub, ...body };
    return await this.codeService.createCodeTemplate(dto);
  }

  @ApiOperation({
    summary: '코드 템플릿 생성/수정',
    description:
      '코드 템플릿을 생성하거나 수정합니다. uuid가 제공되면 수정, 없으면 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '코드 템플릿 수정 성공',
    type: null,
  })
  @ApiResponse({
    status: 404,
    description: '코드 템플릿을 찾지 못했을 때',
  })
  @Patch('/template')
  async updateCodeTemplate(
    @Body() body: RequestUpsertCodeTemplateDto,
    @User() user: TokenUser,
  ) {
    const { sub } = user;
    const dto = { userUuid: sub, ...body };
    return await this.codeService.updateCodeTemplate(dto);
  }

  @ApiOperation({
    summary: '코드 템플릿 삭제',
    description: '특정 코드 템플릿을 삭제합니다.',
  })
  @ApiParam({
    name: 'uuid',
    description: '삭제할 템플릿의 고유 식별자',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '코드 템플릿 삭제 성공',
    type: ResponseDto<[ResponseDeleteCodeTemplateDto]>,
  })
  @ApiResponse({
    status: 404,
    description: '삭제할 코드 템플릿을 찾을 수 없음',
  })
  @Delete('/template/:uuid')
  async deleteTemplate(@Param('uuid') uuid: string, @User() user: TokenUser) {
    const { sub } = user;
    const dto = { uuid, userUuid: sub };
    return await this.codeService.deleteCodeTemplate(dto);
  }

  @ApiOperation({
    summary: '문제 코드 조회',
    description: '특정 문제에 대한 사용자의 코드를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '문제 코드 조회 성공',
    type: ResponseDto<ResponseProblemCodeDto[]>,
  })
  @ApiResponse({
    status: 404,
    description: '두 가지 NotFound 에러 상황',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              example: 'NOT_FOUND_PROBLEM',
            },
            message: {
              type: 'string',
              example: '문제를 찾을 수 없습니다.',
            },
          },
          required: ['code', 'message'],
        },
        {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              example: 'NOT_FOUND_PROBLEM_CODE',
            },
            message: {
              type: 'string',
              example: '저장된 코드가 없습니다.',
            },
          },
          required: ['code', 'message'],
        },
      ],
    },
  })
  @Get('/problem/:problemUuid')
  async getProblemCodes(
    @User() user: TokenUser,
    @Param(
      'problemUuid',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    problemUuid: string,
  ) {
    const { sub } = user;
    const dto = { userUuid: sub, problemUuid };
    const problemCode = await this.codeService.getProblemCodes(dto);

    return problemCode;
  }

  @ApiOperation({
    summary: '문제 코드 업데이트',
    description: '특정 문제에 대한 사용자의 코드를 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '문제 코드 업데이트 성공',
    type: ResponseDto<null>,
  })
  @Put('/problem')
  async saveProblemCode(
    @Body() body: RequestUpsertProblemCodeDto,
    @User() user: TokenUser,
  ) {
    const { sub } = user;
    const dto = { userUuid: sub, ...body };
    await this.codeService.upsertProblemCode(dto);
    return null;
  }
}

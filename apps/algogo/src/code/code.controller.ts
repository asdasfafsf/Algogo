import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CodeService } from './code.service';
import { AuthGuard } from '../auth/auth.guard';
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
import RequestUpsertCodeTemplateDto from './dto/RequestUpsertCodeTemplate';
import RequestUpsertProblemCodeDto from './dto/RequestUpsertProblemCodeDto';

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
  async getCodeSetting(@Req() req: AuthRequest) {
    const codeSetting = await this.codeService.getCodeSetting(req.userNo);
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
    @Req() req: AuthRequest,
    @Body() requestUpsertCodeSettingDto: RequestUpsertCodeSettingDto,
  ) {
    const { userNo } = req;
    const dto = { userNo, ...requestUpsertCodeSettingDto };
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
  async getTemplateResult(@Req() req: AuthRequest) {
    const { userNo } = req;
    const { defaultList, summaryList } =
      await this.codeService.getCodeTemplateResult(userNo);
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
  async getTemplate(@Param('uuid') uuid: string, @Req() req: AuthRequest) {
    const { userNo } = req;
    const dto = { userNo, uuid };
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
    @Req() req: AuthRequest,
  ) {
    const { userNo } = req;
    const dto = { userNo, ...body };
    return null;
  }

  @ApiOperation({
    summary: '코드 템플릿 생성/수정',
    description:
      '코드 템플릿을 생성하거나 수정합니다. uuid가 제공되면 수정, 없으면 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '코드 템플릿 생성/수정 성공',
    type: null,
  })
  @Put('/template')
  async upsertTemplate(
    @Body() body: RequestUpsertCodeTemplateDto,
    @Req() req: AuthRequest,
  ) {
    const { userNo } = req;
    const dto = { userNo, ...body };
    return null;
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
  })
  @ApiResponse({
    status: 404,
    description: '삭제할 코드 템플릿을 찾을 수 없음',
  })
  @Delete('/template/:uuid')
  async deleteTemplate(@Param('uuid') uuid: string, @Req() req: AuthRequest) {
    const dto = { uuid, userNo: req.userNo };
    return null;
  }

  @ApiOperation({
    summary: '문제 코드 조회',
    description: '특정 문제에 대한 사용자의 코드를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '문제 코드 조회 성공',
    type: String,
  })
  @Get('/problem/:problemUuid')
  async getProblemCode(
    @Req() req: AuthRequest,
    @Param('problemUuid') problemUuid: string,
  ) {
    const { userNo } = req;
    const dto = { userNo, problemUuid };
    return '';
  }

  @ApiOperation({
    summary: '문제 코드 업데이트',
    description: '특정 문제에 대한 사용자의 코드를 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '문제 코드 업데이트 성공',
    type: String,
  })
  @Put('/problem')
  async saveProblemCode(
    @Body() body: RequestUpsertProblemCodeDto,
    @Req() req: AuthRequest,
  ) {
    const { userNo } = req;
    const dto = { userNo, ...body };
    return null;
  }
}

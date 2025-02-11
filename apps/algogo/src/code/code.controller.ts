import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CodeService } from './code.service';
import { AuthGuard } from '../auth/auth.guard';
import RequestUpsertCodeSettingDto from './dto/RequestUpsertCodeSettingDto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseCodeSettingDto } from './dto/ResponseCodeSettingDto';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { ApiBadRequestErrorResponse } from '../common/decorators/swagger/ApiBadRequestErrorResponse';
import ResponseCodeTemplate from './dto/ResponseCodeTemplate';
import ResponseCodeTemplateSummary from './dto/ResponseCodeTemplateSummary';
import ResponseCodeTemplateResult from './dto/ResponseCodeTemplateResult';
import RequestUpsertDefaultCodeTemplateDto from './dto/RequestUpsertDefaultCodeTemplateDto';

@ApiGlobalErrorResponses()
@ApiBadRequestErrorResponse()
@ApiTags('Code API')
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
  @Get('/setting')
  async getCodeSetting() {
    return new ResponseCodeSettingDto();
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
    return new ResponseCodeSettingDto();
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
  async getTemplateList() {
    return new ResponseCodeTemplateResult();
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
  async getTemplate() {
    return new ResponseCodeTemplate();
  }

  @Put('/template/default')
  async setDefaultTemplate(
    @Body() body: RequestUpsertDefaultCodeTemplateDto,
    @Req() req: AuthRequest,
  ) {
    const { userNo } = req;
    const dto = { userNo, ...body };
    return null;
  }

  @Post('/template')
  async createTemplate() {
    return '';
  }

  @Patch('/template')
  async updateTemplate() {}

  @Delete('/template/:uuid')
  async deleteTemplate() {
    return '';
  }

  @Get('/problem')
  async getProblemCode() {
    return '';
  }

  @Put('/problem')
  async updateProblemCode() {
    return '';
  }
}

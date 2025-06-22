import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../authorization/roles.guard';
import { AuthGuard } from '../auth-guard/auth.guard';
import { Roles } from '../common/decorators/authorization/roles.decorator';
import { ROLES } from '../common/constants/roles.constants';
import { ProblemSiteService } from './problem-site.service';
import { CreateProblemSiteDto } from './dto/create-problem-site.dto';
import { TokenUser } from 'src/common/types/request.type';
import { User } from 'src/common/decorators/contexts/user.decorator';
import { ProblemSiteProvider } from 'src/common/types/problem-site.type';

@ApiTags('문제 사이트 관리')
@ApiBearerAuth('Authorization')
@Controller('api/v1/problem-site')
@UseGuards(AuthGuard, RolesGuard)
@Roles([ROLES.VIP, ROLES.ADMIN])
export class ProblemSiteController {
  constructor(private readonly problemSiteService: ProblemSiteService) {}

  @Post()
  @ApiOperation({
    summary: '문제 사이트 계정 연동',
    description: 'VIP 또는 관리자가 문제 사이트 계정을 연동합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '문제 사이트 계정이 성공적으로 연동되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '연동 ID' },
        provider: {
          type: 'string',
          enum: ['BOJ'],
          description: '문제 사이트 제공자',
        },
        handle: { type: 'string', description: '계정 핸들/아이디' },
        userUuid: { type: 'string', description: '사용자 UUID' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 403,
    description: 'VIP 또는 관리자 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 연동된 계정입니다.',
  })
  async createProblemSite(
    @User() user: TokenUser,
    @Body() createProblemSiteDto: CreateProblemSiteDto,
  ) {
    return this.problemSiteService.createProblemSite({
      ...createProblemSiteDto,
      userUuid: user.sub,
    });
  }

  @Delete('/:provider')
  @ApiOperation({
    summary: '문제 사이트 계정 연동 해제',
    description: 'VIP 또는 관리자가 문제 사이트 계정 연동을 해제합니다.',
  })
  @ApiParam({
    name: 'provider',
    description: '연동 해제할 문제 사이트 제공자',
    enum: ['BOJ'],
    example: 'BOJ',
  })
  @ApiResponse({
    status: 200,
    description: '문제 사이트 계정 연동이 성공적으로 해제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '계정 연동이 해제되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
  })
  @ApiResponse({
    status: 403,
    description: 'VIP 또는 관리자 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: '연동된 계정을 찾을 수 없습니다.',
  })
  async deleteProblemSite(
    @User() user: TokenUser,
    @Param('provider') provider: ProblemSiteProvider,
  ) {
    return this.problemSiteService.deleteProblemSite({
      userUuid: user.sub,
      provider,
    });
  }
}

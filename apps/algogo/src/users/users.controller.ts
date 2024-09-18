import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseUserDto } from './dto/ResponseUserDto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { AuthGuard } from '../auth/auth.guard';
import { InquiryUserDto } from './dto/InquiryUserDto';
import { USER_NOT_FOUND_MESSAGE } from './constants';
import { UsersService } from './users.service';

@ApiTags('유저(타인) 정보 API')
@ApiBearerAuth('Authorization')
@ApiGlobalErrorResponses()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiOperation({
    summary: '유저 정보 조회',
    description: '유저 정보 조회',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '유저 정보 조회 성공',
    type: ResponseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        status: HttpStatus.NOT_FOUND,
        errorCode: '9999',
        errorMessage: USER_NOT_FOUND_MESSAGE,
      },
    },
    description: '유저 못찾음',
  })
  @Get('/:uuid')
  async getUser(
    @Req() request: AuthRequest,
    @Param('uuid') uuid: string,
  ): Promise<ResponseUserDto> {
    const { userNo } = request;
    const inquiryUserDto: InquiryUserDto = { userNo, uuid };
    const user = await this.usersService.getUser(inquiryUserDto);
    return user;
  }
}

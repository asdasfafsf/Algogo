import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ResponseUserDto } from './dto/ResponseUserDto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { AuthV2Guard } from '../auth-v2/auth-v2.guard';
import { USER_NOT_FOUND_MESSAGE } from './constants';
import { UsersService } from './users.service';
import { User } from '../common/decorators/contexts/user.decorator';
import { TokenUser } from '../common/types/request.type';

@ApiTags('유저(타인) 정보 API')
@ApiBearerAuth('Authorization')
@ApiGlobalErrorResponses()
@Controller('users')
@UseGuards(AuthV2Guard)
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
  async getUser(@User() user: TokenUser, @Param('uuid') uuid: string) {
    const userInfo = await this.usersService.getUser({ userUuid: uuid });
    return userInfo;
  }
}

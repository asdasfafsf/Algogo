import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequestUpdateMeDto } from './dto/RequestUpdateMeDto';
import { MeService } from './me.service';
import { AuthGuard } from '../auth/auth.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MULTER_OPTION } from './me.constants';
import { ResponseMeDto } from './dto/ResponseMeDto';
import { ApiGlobalErrorResponses } from '../common/decorators/swagger/ApiGlobalErrorResponse';
import { RequestUpdateSocialDto } from './dto/RequestUpdateSocialDto';
import { validate } from 'class-validator';

@ApiTags('사용자 자기 자신의 관련된 API')
@ApiBearerAuth('Authorization')
@ApiGlobalErrorResponses()
@Controller('api/v1/me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @ApiOperation({
    summary: '내 정보 불러오기',
    description: '사용자의 정보를 불러옵니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '정상',
    type: ResponseMeDto,
  })
  @Get('')
  async getMe(@Req() request: AuthRequest) {
    const { userNo } = request;
    return await this.meService.getMe(userNo);
  }

  @ApiOperation({
    summary: '내 정보 및 프로필 사진 업데이트',
    description: '사용자의 정보를 업데이트하고 프로필 사진을 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: '정상',
    type: ResponseMeDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '유효성 오류 또는 잘못된 요청',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file',
        },
        name: {
          type: 'string',
          description: '사용자의 이름',
          example: 'John Doe',
        },
        socialList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              provider: {
                type: 'string',
                description: '소셜 미디어 제공자',
                example: 'instagram',
              },
              content: {
                type: 'string',
                description: '소셜 미디어 링크',
                example: 'https://instagram.com/johndoe',
              },
            },
          },
          description: '사용자의 소셜 미디어 정보 리스트',
          example: [
            {
              provider: 'instagram',
              content: 'https://instagram.com/johndoe',
            },
            {
              provider: 'github',
              content: 'https://github.com/johndoe',
            },
            {
              provider: 'linkedin',
              content: 'https://linkedin.com/in/johndoe',
            },
            {
              provider: 'youtube',
              content: 'https://youtube.com/user/johndoe',
            },
          ],
        },
      },
    },
  })
  @Patch('profile')
  @UseInterceptors(FileInterceptor('file', MULTER_OPTION))
  async updateMe(
    @Req() request: AuthRequest, // 인증된 사용자 정보
    @UploadedFile() file: Express.Multer.File, // 파일
    @Body('name') name: string, // 이름 (name 필드)
    @Body('socialList') socialListString: string, // socialList 필드를 JSON 문자열로 받음
  ): Promise<ResponseMeDto> {
    const { userNo } = request;

    let socialList: RequestUpdateSocialDto[];
    try {
      socialList = JSON.parse(socialListString ?? '[]');
    } catch (error) {
      throw new BadRequestException('Invalid socialList format');
    }

    const updateMeDto = new RequestUpdateMeDto();
    updateMeDto.name = name;
    updateMeDto.socialList = socialList;

    const errors = await validate(updateMeDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const responseMeDto = await this.meService.updateMe({
      name,
      socialList,
      userNo,
      file,
    });

    return responseMeDto;
  }
}

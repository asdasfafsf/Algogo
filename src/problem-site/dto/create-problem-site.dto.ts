import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProblemSiteProvider } from '../../common/types/problem-site.type';

export class CreateProblemSiteDto {
  @ApiProperty({
    description: '문제 사이트 제공자',
    example: 'BOJ',
    enum: ['BOJ'],
    enumName: 'ProblemSiteProvider',
  })
  @IsNotEmpty()
  @IsString()
  provider: ProblemSiteProvider;

  @ApiProperty({
    description: '문제 사이트 계정 핸들/아이디',
    example: 'my_boj_handle',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  handle: string;
}

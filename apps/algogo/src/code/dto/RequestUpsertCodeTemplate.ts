import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength, IsOptional } from 'class-validator';

export default class RequestUpsertCodeTemplateDto {
  @ApiProperty({
    description: '템플릿 제목',
    example: '기본 정렬 알고리즘',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    description: '템플릿 내용',
    example: 'function solution() { ... }',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    description: '템플릿 설명 (선택사항)',
    example: '배열을 정렬하는 기본적인 방법을 보여주는 예제입니다.',
    required: false,
    default: '',
    minLength: 0,
    maxLength: 100,
  })
  @IsString()
  @Length(0, 100)
  @IsOptional()
  description: string = '';
}

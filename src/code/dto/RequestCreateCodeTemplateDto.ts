import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { LanguageProvider } from '../../common/types/language.type';
import { LANGUAGE_PROVIDER } from '../../common/constants/language.constant';

export default class RequestCreateCodeTemplateDto {
  @ApiProperty({
    description: '템플릿 제목',
    example: '기본 정렬 알고리즘',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

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
  description?: string;

  @ApiProperty({
    description: '프로그래밍 언어',
    required: true,
    example: LANGUAGE_PROVIDER.PYTHON,
    enum: LANGUAGE_PROVIDER,
    nullable: false,
  })
  @IsEnum(LANGUAGE_PROVIDER, {
    message: '지원하지 않는 프로그래밍 언어입니다.',
  })
  language: LanguageProvider;

  @ApiProperty({
    description: '기본 템플릿 여부',
    example: false,
    required: false,
  })
  @IsBoolean({
    message: '기본 템플릿 여부는 불리언 값이어야 합니다.',
  })
  isDefault: boolean;
}

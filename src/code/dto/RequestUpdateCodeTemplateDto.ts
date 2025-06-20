import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  MinLength,
  IsOptional,
  IsEnum,
  Max,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export default class RequestUpdateCodeTemplateDto {
  @ApiProperty({
    description: '업데이트할 템플릿의 UUID. 업데이트 시 필수 입력 항목입니다.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    minLength: 1,
    required: true,
  })
  @IsString({ message: '템플릿 UUID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '템플릿 UUID는 필수 항목입니다.' })
  uuid: string;

  @ApiProperty({
    description: '템플릿 제목',
    example: '기본 정렬 알고리즘',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '템플릿 제목은 문자열이어야 합니다.' })
  @Max(100, { message: '템플릿 제목은 최대 100자까지 허용됩니다.' })
  name?: string;

  @ApiProperty({
    description: '템플릿 내용',
    example: 'function solution() { ... }',
    minLength: 1,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '템플릿 내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '템플릿 내용은 최소 1자 이상이어야 합니다.' })
  content?: string;

  @ApiProperty({
    description: '템플릿 설명 (선택사항)',
    example: '배열을 정렬하는 기본적인 방법을 보여주는 예제입니다.',
    required: false,
    default: '',
    minLength: 0,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '템플릿 설명은 문자열이어야 합니다.' })
  @Length(0, 100, { message: '템플릿 설명은 100자 이내여야 합니다.' })
  description?: string;

  @ApiProperty({
    description: '프로그래밍 언어',
    required: true,
    example: LanguageProvider.PYTHON,
    enum: LanguageProvider,
    nullable: false,
  })
  @IsEnum(LanguageProvider, {
    message: '지원하지 않는 프로그래밍 언어입니다.',
  })
  @IsNotEmpty({ message: '프로그래밍 언어는 필수 항목입니다.' })
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

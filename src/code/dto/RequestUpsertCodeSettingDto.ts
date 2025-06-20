import { IsNumber, IsOptional, Min, Max, IsIn, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { LanguageProvider } from '../../common/types/language.type';
import { ApiProperty } from '@nestjs/swagger';
import { LANGUAGE_PROVIDER } from '../../common/constants/language.constant';

export default class RequestUpsertCodeSettingDto {
  @ApiProperty({
    description: '코드 에디터 폰트 크기',
    minimum: 14,
    maximum: 21,
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: '숫자만 입력할 수 있습니다.' })
  @Max(21, { message: '최대 21 까지 가능합니다.' })
  @Min(14, { message: '최소 14 이상이어야 합니다.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  fontSize?: number;

  @ApiProperty({
    description: '문제 내용 영역 비율 (%)',
    minimum: 100,
    maximum: 200,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(100, { message: '최소 100 이상이어야 합니다.' })
  @Max(200, { message: '최대 200 이하이어야 합니다.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  problemContentRate?: number;

  @ApiProperty({
    description: '탭 크기',
    minimum: 2,
    maximum: 8,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(2, { message: '최소 2 이상이어야 합니다.' })
  @Max(8, { message: '최대 8 이하이어야 합니다.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  tabSize?: number;

  @ApiProperty({
    description: '라인 넘버 표시 방식',
    enum: ['on', 'of', 'relative'],
    required: false,
    example: 'on',
  })
  @IsOptional()
  @IsIn(['on', 'of', 'relative'], {
    message: '유효한 값은 "on", "of", "relative"입니다.',
  })
  lineNumber?: 'on' | 'of' | 'relative';

  @ApiProperty({
    description: '기본 프로그래밍 언어',
    enum: LANGUAGE_PROVIDER,
    required: false,
  })
  @IsOptional()
  @IsEnum(LANGUAGE_PROVIDER, { message: '유효한 언어가 아닙니다' })
  defaultLanguage?: LanguageProvider;

  @ApiProperty({
    description: '테마',
    enum: ['vs-dark', 'light'],
    required: false,
    example: 'vs-dark',
  })
  @IsOptional()
  @IsIn(['vs-dark', 'light'], {
    message: '유효한 값은 "vs-dark", "light"입니다.',
  })
  theme?: 'vs-dark' | 'light';
}

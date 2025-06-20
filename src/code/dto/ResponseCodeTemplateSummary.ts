import { LanguageProvider } from '../../common/types/language.type';
import { ApiProperty } from '@nestjs/swagger';
import { LANGUAGE_PROVIDER } from 'src/common/constants/language.constant';

export default class ResponseCodeTemplateSummary {
  @ApiProperty({
    description: '템플릿의 고유 식별자',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    description: '템플릿 이름',
    example: '기본 자바스크립트 템플릿',
  })
  name: string;

  @ApiProperty({
    description: '프로그래밍 언어 제공자',
    enum: LANGUAGE_PROVIDER,
    example: LANGUAGE_PROVIDER.CPP,
  })
  language: LanguageProvider;

  @ApiProperty({
    description: '생성 일시',
    example: '2024-03-21T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    example: '2024-03-21T12:00:00Z',
  })
  updatedAt: Date;
}

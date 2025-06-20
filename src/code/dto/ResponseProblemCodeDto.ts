import { ApiProperty } from '@nestjs/swagger';
import { LanguageProvider } from '../../common/types/language.type';
import { LANGUAGE_PROVIDER } from 'src/common/constants/language.constant';

export class ResponseProblemCodeDto {
  @ApiProperty({
    description: '문제의 UUID입니다.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  problemUuid: string;

  @ApiProperty({
    description: '사용 언어를 나타냅니다.',
    example: LANGUAGE_PROVIDER.NODEJS, // 실제 enum의 값으로 수정하세요.
  })
  language: LanguageProvider;

  @ApiProperty({
    description: '문제에 대한 코드 내용을 포함합니다.',
    example: 'console.log("Hello, World!");',
  })
  content: string;

  @ApiProperty({
    description: '코드 생성시간',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '코드 수정시간',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

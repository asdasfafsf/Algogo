import { ApiProperty } from '@nestjs/swagger';
import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export class ResponseProblemCodeDto {
  @ApiProperty({
    description: '문제의 UUID입니다.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  problemUuid: string;

  @ApiProperty({
    description: '사용 언어를 나타냅니다.',
    example: LanguageProvider.NODEJS, // 실제 enum의 값으로 수정하세요.
  })
  language: LanguageProvider;

  @ApiProperty({
    description: '문제에 대한 코드 내용을 포함합니다.',
    example: 'console.log("Hello, World!");',
  })
  content: string;
}

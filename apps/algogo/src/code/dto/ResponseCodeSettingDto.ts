import { ApiProperty } from '@nestjs/swagger';
import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export class ResponseCodeSettingDto {
  @ApiProperty({
    description: '폰트 크기',
    example: 14,
  })
  fontSize: number;

  @ApiProperty({
    description: '문제 내용 영역 비율',
    example: 100,
  })
  problemContentRate: number;

  @ApiProperty({
    description: '에디터 테마',
    example: 'vs-dark',
  })
  theme: string;

  @ApiProperty({
    description: '탭 크기',
    example: 4,
  })
  tabSize: number;

  @ApiProperty({
    description: '라인 넘버 표시 여부',
    example: 'on',
  })
  lineNumber: string;

  @ApiProperty({
    description: '기본 프로그래밍 언어',
    example: 'cpp',
  })
  defaultLanguage: LanguageProvider;
}

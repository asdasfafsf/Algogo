import { ApiProperty } from '@nestjs/swagger';
import { LanguageProvider } from '../../common/types/language.type';
import { IsString, IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { MaxBytes } from '../../common/decorators/MaxBytes';
import { LANGUAGE_PROVIDER } from 'src/common/constants/language.constant';

export default class RequestUpsertProblemCodeDto {
  @ApiProperty({
    description: '문제 고유 식별자',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'UUID 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '문제 식별자는 필수 입력값입니다.' })
  problemUuid: string;

  @ApiProperty({
    description: '문제 코드',
    example: 'console.log("Hello, World!");',
  })
  @IsString({ message: '문제 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '문제 코드는 필수 입력값입니다.' })
  @MaxBytes(16383, {
    message: '문제 코드는 16,383 바이트를 초과할 수 없습니다.',
  })
  content: string;

  @ApiProperty({
    description: '프로그래밍 언어',
    example: 'javascript',
  })
  @IsEnum(LANGUAGE_PROVIDER, {
    message: '지원하지 않는 프로그래밍 언어입니다.',
  })
  @IsNotEmpty({ message: '프로그래밍 언어는 필수 입력값입니다.' })
  language: LanguageProvider;
}

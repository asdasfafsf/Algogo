import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, ValidateIf } from 'class-validator';
import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export default class RequestUpsertDefaultCodeTemplateDto {
  @ApiProperty({
    description: '템플릿 UUID (기존 템플릿 수정 시 필수)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    nullable: false,
  })
  @IsUUID(undefined, {
    message: 'UUID 형식이 올바르지 않습니다.',
  })
  @ValidateIf((o) => !o.content || o.uuid, {
    message: '기존 템플릿을 수정할 때는 UUID가 필요합니다.',
  })
  uuid?: string;

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
  language: LanguageProvider;
}

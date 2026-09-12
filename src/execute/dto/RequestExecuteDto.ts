import { LanguageProvider } from '../../common/types/language.type';
import { LANGUAGE_PROVIDER } from '../../common/constants/language.constant';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { RequestExecuteInputDto } from './RequestExecuteInputDto';

export class RequestExecuteDto {
  @IsEnum(LANGUAGE_PROVIDER)
  provider!: LanguageProvider;

  @IsString()
  code!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestExecuteInputDto)
  inputList!: RequestExecuteInputDto[];
}

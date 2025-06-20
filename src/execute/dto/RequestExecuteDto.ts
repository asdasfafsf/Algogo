import { LanguageProvider } from '../../common/types/language.type';

export class RequestExecuteDto {
  provider: LanguageProvider;
  input: string;
}

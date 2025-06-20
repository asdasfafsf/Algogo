import { LanguageProvider } from '../../common/types/language.type';

export class RequestCompileDto {
  id: string;
  code: string;
  provider: LanguageProvider;
}

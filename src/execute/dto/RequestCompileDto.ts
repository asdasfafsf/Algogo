import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export class RequestCompileDto {
  id: string;
  code: string;
  provider: LanguageProvider;
}

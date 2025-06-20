import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export class RequestExecuteDto {
  provider: LanguageProvider;
  input: string;
}

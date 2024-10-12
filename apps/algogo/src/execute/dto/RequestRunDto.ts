import { RequestExecuteInputDto } from '@libs/core/dto/RequestExecuteInputDto';
import { LanguageProvider } from '../../common/enums/LanguageProviderEnum';

export class RequestRunDto {
  id: string;
  provider: LanguageProvider;
  code: string;
  inputList: RequestExecuteInputDto[];
}

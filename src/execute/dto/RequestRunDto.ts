import { RequestExecuteInputDto } from './RequestExecuteInputDto';
import { LanguageProvider } from '../../common/types/language.type';

export class RequestRunDto {
  id: string;
  provider: LanguageProvider;
  code: string;
  inputList: RequestExecuteInputDto[];
}

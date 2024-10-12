import { ExecuteProviderEnum } from '../enum/ExecuteProvider';

export class RequestCompileDto {
  provider: ExecuteProviderEnum;
  code: string;
}

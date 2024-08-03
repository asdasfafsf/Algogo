import { Injectable, Inject } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteProvider,
  ExecuteServiceFactory,
} from './execute.provider';

@Injectable()
export class RunService {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
  ) {}

  async execute(provider: ExecuteProvider, code: string, input: string) {
    const executor = await this.executorFactory.get(provider);
    const result = await executor.execute(code, input);

    return result;
  }
}

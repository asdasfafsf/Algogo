import { Injectable, Inject } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteProvider,
  ExecuteServiceFactory,
} from './execute.provider';
import { Logger } from 'winston';

@Injectable()
export class RunService {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  async execute(provider: ExecuteProvider, code: string, input: string) {
    try {
      const executor = await this.executorFactory.get(provider);
      const result = await executor.execute(code, input);

      return result;
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }
}

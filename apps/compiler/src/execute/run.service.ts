import { Injectable, Inject } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteProvider,
  ExecuteServiceFactory,
} from './execute.provider';
import { Logger } from 'winston';
import TimeoutError from './error/timeout-error';
import { ResponseExecuteResultDto } from '@libs/core/dto/ResponseExecuteResultDto';
import RuntimeError from './error/runtime-error';
import CompileError from './error/compile-error';

@Injectable()
export class RunService {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  async execute(
    provider: ExecuteProvider,
    code: string,
    input: string,
  ): Promise<ResponseExecuteResultDto> {
    try {
      const executor = await this.executorFactory.get(provider);
      const result = await executor.execute(code, input);

      return { ...result, code: '0000' };
    } catch (e) {
      const format = {
        processTime: 0,
        memory: 0,
      };

      if (e instanceof TimeoutError) {
        return {
          ...format,
          code: '9000',
          result: '시간 초과',
        };
      }

      if (e instanceof RuntimeError) {
        return {
          ...format,
          code: '9001',
          result: '런타임 에러',
        };
      }

      if (e instanceof CompileError) {
        return {
          ...format,
          code: '9002',
          result: '컴파일 에러',
        };
      }

      this.logger.error(e.message);
      throw e;
    }
  }
}

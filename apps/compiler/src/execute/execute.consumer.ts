import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteServiceFactory,
} from './execute.provider';
import CompileError from './error/compile-error';
import RuntimeError from './error/runtime-error';
import TimeoutError from './error/timeout-error';
import { ResponseExecuteResultDto } from '@libs/core/dto/ResponseExecuteResultDto';

@Processor('execute')
export class ExecuteConsumer extends WorkerHost {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
  ) {
    super();
    this.cache = new Map();
  }

  private cache: Map<string, ResponseExecuteResultDto>;

  async process(job: Job): Promise<any> {
    const { name, data } = job;
    const { provider, id, seq } = data;
    const executor = await this.executorFactory.get(provider);

    try {
      if (name === 'compile') {
        const { code } = data;
        const compileResult = await executor.compile(code);
        this.cache.set(id, compileResult);
        return {
          ...compileResult,
        };
      } else if (name === 'execute') {
        const { input, seq } = data;
        const compileResult = this.cache.get(id);

        if (compileResult.code !== '0000') {
          return {
            ...compileResult,
            result: '컴파일 오류',
          };
        }
        const executeResult = await executor.execute(
          compileResult.result,
          input,
        );
        return { ...executeResult, seq };
      } else {
        this.cache.delete(id);
        return true;
      }
    } catch (e) {
      const format = {
        processTime: 0,
        memory: 0,
        seq,
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
          result: '런타임 에러(' + (e.message || 'Unknown') + ')',
        };
      }

      if (e instanceof CompileError) {
        return {
          ...format,
          code: '9002',
          result: '컴파일 에러',
        };
      }

      return {
        ...format,
        code: '9999',
        result: '예외 오류',
      };
    } finally {
      // this.cache.delete(id ?? '');
    }
  }
}

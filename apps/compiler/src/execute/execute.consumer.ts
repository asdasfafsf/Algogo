import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import {
  EXECUTE_SERVICE_FACTORY_NAME,
  ExecuteServiceFactory,
} from './execute.provider';
import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';
import CompileError from './error/compile-error';
import PreprocessError from './error/preprocess-error';
import RuntimeError from './error/runtime-error';

@Processor('execute')
export class ExecuteConsumer extends WorkerHost {
  constructor(
    @Inject(EXECUTE_SERVICE_FACTORY_NAME)
    private readonly executorFactory: ExecuteServiceFactory,
  ) {
    super();
    this.cache = new Map();
  }

  private cache: Map<string, ResponseExecuteDto>;

  async process(job: Job): Promise<any> {
    const { name, data } = job;
    const { provider, id } = data;

    console.log(`name : ${name}`);
    console.log(data);

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
        const compileResult = this.cache.get(id);
        const executeResult = await executor.execute(compileResult.result, '1');
        return executeResult;
      } else {
        this.cache.delete(id);
        return true;
      }
    } catch (e) {
      console.error(e);
      if (e instanceof CompileError) {
        return {
          code: '9999',
          message: e.message,
          result: e.message,
        };
      }

      if (e instanceof RuntimeError) {
        return {
          code: '9001',
          result: `런타임 에러${e.message}`,
          message: `런타임 에러${e.message}`,
        };
      }

      if (e instanceof PreprocessError) {
        return {
          code: '9999',
          message: '파일 전처리 중 오류가 발생하였습니다.',
          result: '파일 전처리 중 오류가 발생하였습니다.',
        };
      }
    } finally {
    }

    return {};
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { FlowProducer, QueueEvents } from 'bullmq';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';
import { uuidv7 } from 'uuidv7';
import { CustomLogger } from '../logger/custom-logger';
import { RequestCompileDto } from './dto/RequestCompileDto';
import { RequestRunDto } from './dto/RequestRunDto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ExecuteService implements OnModuleInit {
  constructor(
    @Inject(bullmqConfig.KEY)
    private readonly config: ConfigType<typeof bullmqConfig>,
    private readonly logger: CustomLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private flowProducer: FlowProducer;
  private queueEvents: QueueEvents;

  async onModuleInit() {
    this.flowProducer = new FlowProducer({
      connection: {
        ...this.config,
      },
    });
    await this.flowProducer.waitUntilReady();

    this.queueEvents = new QueueEvents(this.config.queueName, {
      connection: {
        ...this.config,
      },
    });

    await this.queueEvents.waitUntilReady();
  }

  async generateJobId(provider: string) {
    return `${provider}_${Math.floor(new Date().getTime() / 1000)}_${uuidv7()}`;
  }

  async run(requestExecuteDto: RequestRunDto): Promise<any> {
    try {
      const { code, provider, inputList, id } = requestExecuteDto;
      const requestCompileDto = {
        id,
        code,
        provider,
      } as RequestCompileDto;

      const flow = await this.flowProducer.add({
        name: 'run',
        queueName: this.config.queueName,
        children: [
          {
            name: 'compile',
            queueName: this.config.queueName,
            data: requestCompileDto,
            opts: {
              priority: 1,
            },
          },
          ...inputList.map(({ seq, input }) => ({
            name: 'execute',
            queueName: this.config.queueName,
            data: {
              id,
              seq,
              input,
              provider,
            },
            opts: {
              priority: 3,
            },
          })),
        ],
      });

      const compileJob = flow.children.find(
        (elem) => elem.job.name === 'compile',
      )!.job;
      const compileResult = await compileJob.waitUntilFinished(
        this.queueEvents,
        2000,
      );

      if (compileResult.code !== '0000') {
        return {
          ...compileResult,
          result: '컴파일 에러',
        };
      }

      const executeJobList = flow.children
        .filter((elem) => elem.job.name === 'execute')
        .map((elem) => elem.job);

      for (const executeJob of executeJobList) {
        const executeResult = await executeJob.waitUntilFinished(
          this.queueEvents,
          5000,
        );

        this.eventEmitter.emitAsync(`execute`, {
          ...executeResult,
          id,
        });
      }

      const res = await flow.job.waitUntilFinished(this.queueEvents, 2000);

      return {
        processTime: 0,
        memory: 0,
        code: '0000',
        result: res,
      };
    } catch (error) {
      this.logger.error(error.message);
      if (error?.message?.includes('timed out before finishing')) {
        return {
          processTime: 0,
          memory: 0,
          code: '9000',
          result: '시간 초과',
        };
      }
      return {
        processTime: 0,
        memory: 0,
        code: '9999',
        result: '예외 오류',
      };
    } finally {
    }
  }
}

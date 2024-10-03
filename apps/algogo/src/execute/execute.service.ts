import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { FlowProducer, Queue, QueueEvents } from 'bullmq';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';
import { uuidv7 } from 'uuidv7';
import { ResponseExecuteResultDto } from '@libs/core/dto/ResponseExecuteResultDto';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class ExecuteService implements OnModuleInit {
  constructor(
    @Inject(bullmqConfig.KEY)
    private readonly config: ConfigType<typeof bullmqConfig>,
    private readonly logger: CustomLogger,
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

    this.queueEvents.on('completed', async (job) => {
      this.logger.silly('complete job', job);
    });

    this.queueEvents.on('failed', async (job) => {
      this.logger.silly('complete job', job);
    });
  }

  async generateJobId(provider: string) {
    return `${provider}_${Math.floor(new Date().getTime() / 1000)}_${uuidv7()}`;
  }

  async execute(
    requestExecuteDto: RequestExecuteDto,
  ): Promise<ResponseExecuteResultDto> {
    try {
      const flow = await this.flowProducer.add({
        name: 'execute',
        queueName: this.config.queueName,
        children: [
          {
            name: 'compile',
            data: {
              provider: requestExecuteDto.provider,
              code: requestExecuteDto.code,
            },
            queueName: this.config.queueName,
          },
          ...requestExecuteDto.inputList.map((elem, index) => ({
            name: 'execute',
            queueName: this.config.queueName,
            data: {
              seq: index,
              input: elem,
            },
          })),
        ],
      });

      await flow.job.waitUntilFinished(this.queueEvents);
    } catch (error) {
      if (error?.message?.includes('timed out before finishing')) {
        return {
          processTime: 0,
          memory: 0,
          code: '9001',
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

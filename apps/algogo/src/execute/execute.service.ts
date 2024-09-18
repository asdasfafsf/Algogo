import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import { uuidv7 } from 'uuidv7';
import { ResponseExecuteResultDto } from '@libs/core/dto/ResponseExecuteResultDto';

@Injectable()
export class ExecuteService implements OnModuleInit {
  constructor(
    @Inject(bullmqConfig.KEY)
    private readonly config: ConfigType<typeof bullmqConfig>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  private queue: Queue;
  private queueEvents: QueueEvents;

  async onModuleInit() {
    this.queue = new Queue(this.config.queueName, {
      connection: {
        ...this.config,
      },
    });
    await this.queue.waitUntilReady();

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

  async execute(
    requestExecuteDto: RequestExecuteDto,
  ): Promise<ResponseExecuteResultDto> {
    const { provider } = requestExecuteDto;
    const jobId = await this.generateJobId(provider);

    try {
      const job = await this.queue.add(
        this.config.queueName,
        requestExecuteDto,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          jobId,
          removeOnComplete: true,
          removeOnFail: true,
          priority: 1,
        },
      );
      const result = await job.waitUntilFinished(this.queueEvents);

      return result;
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
      if (await this.queue.getJob(jobId)) {
        this.queue.remove(jobId);
      }
    }
  }
}

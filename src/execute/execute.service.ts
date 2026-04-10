import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { uuidv7 } from 'uuidv7';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';
import { CustomLogger } from '../logger/custom-logger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestRunDto } from './dto/RequestRunDto';

@Injectable()
export class ExecuteService implements OnModuleInit {
  constructor(
    @Inject(bullmqConfig.KEY)
    private readonly config: ConfigType<typeof bullmqConfig>,
    private readonly logger: CustomLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private queueEvents!: QueueEvents;
  private queue!: Queue;

  async onModuleInit() {
    const queueName = this.config.queueName ?? 'default';

    this.queue = new Queue(queueName, {
      connection: {
        ...this.config,
      },
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true,
      },
    });

    await this.queue.waitUntilReady();

    this.queueEvents = new QueueEvents(queueName, {
      connection: {
        ...this.config,
      },
    });

    await this.queueEvents.waitUntilReady();

    this.queueEvents.on('progress', (progress) => {
      this.logger.silly('progress', { progress });

      const progressData = progress as { data: Record<string, unknown>; jobId: string };
      if (progressData.data.stage === 'execute') {
        this.eventEmitter.emit('execute', {
          ...progressData.data,
          stage: undefined,
        });
      }
    });
  }

  async generateJobId(provider: string) {
    return `${provider}_${Math.floor(new Date().getTime() / 1000)}_${uuidv7()}`;
  }

  async run(requestExecuteDto: RequestRunDto): Promise<Record<string, unknown> | { processTime: number; memory: number; code: string; result: string }> {
    try {
      const job = await this.queue.add('run', requestExecuteDto, {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
      });
      const timeout = 1000 * (requestExecuteDto.inputList.length * 2) + 3000;
      const result = await job.waitUntilFinished(this.queueEvents, timeout);

      return result as Record<string, unknown>;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(message);
      if (message.includes('timed out before finishing')) {
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

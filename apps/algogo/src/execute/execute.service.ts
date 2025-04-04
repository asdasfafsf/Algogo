import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';
import { uuidv7 } from 'uuidv7';
import { CustomLogger } from '../logger/custom-logger';
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

  private queueEvents: QueueEvents;
  private queue: Queue;

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

    this.queueEvents.on('progress', (progress) => {
      this.logger.silly('progress', { progress });

      const typedProgress = progress as any;
      if (typedProgress.data.stage === 'execute') {
        this.eventEmitter.emit('execute', {
          ...typedProgress.data,
          stage: undefined,
        });
      }
    });
  }

  async generateJobId(provider: string) {
    return `${provider}_${Math.floor(new Date().getTime() / 1000)}_${uuidv7()}`;
  }

  async run(requestExecuteDto: RequestRunDto): Promise<any> {
    try {
      const job = await this.queue.add('run', requestExecuteDto);
      const result = await job.waitUntilFinished(this.queueEvents);

      return result;
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

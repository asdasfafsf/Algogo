import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class ExecuteService {
  constructor(
    @InjectQueue(process.env.BULLMQ_QUEUE_NAME)
    private readonly queue: Queue,
    @Inject(bullmqConfig.KEY)
    private readonly config: ConfigType<typeof bullmqConfig>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  async generateJobId(provider: string) {
    return `${provider}_${Math.floor(new Date().getTime() / 1000)}_${uuidv7()}`;
  }

  async execute(requestExecuteDto: RequestExecuteDto) {
    const { provider } = requestExecuteDto;
    const jobId = await this.generateJobId(provider);

    const event = new QueueEvents(this.config.queueName, {
      connection: {
        ...this.config,
      },
    });

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
      const result = await job.waitUntilFinished(event);

      return result;
    } catch (error) {
      if (error?.message?.includes('timed out before finishing')) {
        throw new BadRequestException('시간 초과');
      }
      throw new InternalServerErrorException('실행 오류');
    } finally {
      if (await this.queue.getJob(jobId)) {
        this.queue.remove(jobId);
      }
      event.close();
    }
  }
}

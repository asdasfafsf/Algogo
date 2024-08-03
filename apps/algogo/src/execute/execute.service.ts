import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import bullmqConfig from '../config/bullmqConfig';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class ExecuteService {
  constructor(
    @InjectQueue(process.env.BULLMQ_QUEUE_NAME)
    private readonly queue: Queue,
    @Inject(bullmqConfig.KEY)
    private readonly config: ConfigType<typeof bullmqConfig>,
  ) {}

  async generateJobId(provider: string) {
    return `${provider}_${Math.floor(new Date().getTime() / 1000)}`;
  }

  async execute(requestExecuteDto: RequestExecuteDto) {
    const { provider } = requestExecuteDto;
    const jobId = await this.generateJobId(provider);

    const event = new QueueEvents('execute', {
      connection: {
        ...this.config,
      },
    });
    const job = await this.queue.add('execute', requestExecuteDto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      jobId,
      removeOnComplete: true,
      removeOnFail: true,
      priority: 1,
    });

    const result = await job.waitUntilFinished(event, 3000);
    return result;
  }
}

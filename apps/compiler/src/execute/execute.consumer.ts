import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RunService } from './run.service';

@Processor('execute')
export class ExecuteConsumer extends WorkerHost {
  constructor(private readonly runService: RunService) {
    super();
  }
  async process(job: Job): Promise<any> {
    const data = job.data;
    const { provider, code, input } = data;
    const result = await this.runService.execute(provider, code, input);
    return result;
  }
}

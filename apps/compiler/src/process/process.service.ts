import { Injectable } from '@nestjs/common';
import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn,
} from 'child_process';
import { ProcessManagementService } from './process-management.service';
import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class ProcessService {
  tasks: Map<string, ChildProcessWithoutNullStreams>;

  constructor(
    private readonly processManagementService: ProcessManagementService,
  ) {
    this.tasks = new Map();
  }

  async execute(
    command: string,
    commandArgs: string[],
    option?: SpawnOptionsWithoutStdio,
    input?: string,
  ): Promise<ResponseExecuteDto> {
    if (this.tasks.size > 2) {
      throw new Error('MAX SIZE Process Pool');
    }
    option.timeout = option.timeout ?? 5000;

    const uuid = uuidv7();
    const startTime = performance.now();
    const process = spawn(command, commandArgs, option);
    this.tasks.set(uuid, process);

    if (!process) {
      throw new Error('Unknown process');
    }
    let currentMemory = 0;

    const checkProcessUsageInterval = setInterval(async () => {
      try {
        const processUsage =
          await this.processManagementService.getProcessUsage(process.pid);
        const { memory } = processUsage;
        currentMemory = Math.max(memory, currentMemory);
      } catch (e) {
        clearInterval(checkProcessUsageInterval);
      }
    }, 1);

    return new Promise<ResponseExecuteDto>((resolve, reject) => {
      const result = [];

      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
      process.stdout.on('data', (e) => {
        result.push(e.toString());
      });

      process.on('exit', async () => {
        clearInterval(checkProcessUsageInterval);
      });

      process.on('close', async (closeCode) => {
        if (closeCode === 0) {
          resolve({
            processTime: Number((performance.now() - startTime).toFixed(1)),
            memory: Number((currentMemory / Math.pow(1024, 1)).toFixed(1)),
            result: result.join('\n').trim(),
          });
        } else {
          reject(new Error('시간 초과'));
        }
      });

      process.on('error', () => {
        reject(new Error('Unexpected Error'));
      });

      process.stderr.on('data', (e) => {
        const stderr = e.toString();
        reject(new Error(stderr));
      });
    })
      .then((responseExecute) => responseExecute)
      .finally(() => {
        clearInterval(checkProcessUsageInterval);
        process.kill();
        this.tasks.delete(uuid);
      });
  }

  async clearAllProcesses() {
    this.tasks.forEach((process) => {
      if (process.killed === false) {
        process.kill();
      }
    });

    this.tasks.clear();
  }
}

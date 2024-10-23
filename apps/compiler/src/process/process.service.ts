import { Inject, Injectable } from '@nestjs/common';
import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn,
} from 'child_process';
import { ProcessManagementService } from './process-management.service';
import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';
import { uuidv7 } from 'uuidv7';
import { Logger } from 'winston';
import Config from '../config/config';
import { ConfigType } from '@nestjs/config';
import TimeoutError from '../execute/error/timeout-error';

@Injectable()
export class ProcessService {
  tasks: Map<string, ChildProcessWithoutNullStreams>;

  constructor(
    private readonly processManagementService: ProcessManagementService,
    @Inject('winston')
    private readonly logger: Logger,
    @Inject(Config.KEY)
    private readonly config: ConfigType<typeof Config>,
  ) {
    this.tasks = new Map();
  }

  async execute(
    command: string,
    commandArgs: string[],
    option: SpawnOptionsWithoutStdio = {},
    input: string = '',
  ): Promise<ResponseExecuteDto> {
    option.timeout = 3000;
    option.cwd = this.config.tmpDir;

    const uuid = uuidv7();
    const startTime = performance.now();

    this.logger.silly(`Executing command: ${command} ${commandArgs.join(' ')}`);

    const childProcess = spawn(command, commandArgs, option);
    this.tasks.set(uuid, childProcess);

    let currentMemory = 0;

    const checkProcessUsageInterval = setInterval(async () => {
      try {
        const processUsage =
          await this.processManagementService.getProcessUsage(childProcess.pid);
        const { memory } = processUsage;
        currentMemory = Math.max(memory, currentMemory);
      } catch (e) {
        clearInterval(checkProcessUsageInterval);
      }
    }, 1);

    return new Promise<ResponseExecuteDto>((resolve, reject) => {
      const result = [];
      const stdError = [];

      this.logger.silly('process input : ' + input);
      childProcess.stdin.write(input);
      childProcess.stdin.end();

      childProcess.stdout.on('data', (e) => {
        result.push(e.toString());
      });

      childProcess.on('exit', async () => {
        clearInterval(checkProcessUsageInterval);
      });

      childProcess.on('close', async (closeCode, closeResult) => {
        if (closeCode === 0) {
          resolve({
            processTime: Number((performance.now() - startTime).toFixed(1)),
            memory: Number((currentMemory / Math.pow(1024, 1)).toFixed(1)),
            result: result.join('\n').trim(),
          });
          childProcess.kill('SIGKILL');
        }

        // if (stdError.length === 0 && closeCode !== 0) {
        //   reject(new Error('NZEC'));
        // }

        switch (closeResult) {
          case 'SIGSEGV':
            reject(new Error('Segmentation fault'));
            break;
          case 'SIGABRT':
            reject(
              new Error(
                stdError.length > 0 ? stdError.join('') : result.join(''),
              ),
            );
            break;
          case 'SIGTERM':
            reject(new TimeoutError('시간 초과'));
            break;
          case 'SIGBUS':
            reject(new Error('BusError'));
          default:
            reject(new Error(stdError.join('')));
        }
      });

      childProcess.on('error', (error) => {
        reject(error);
      });

      childProcess.stderr.on('data', (error) => {
        const tmpDirPattern = new RegExp(
          `${this.config.tmpDir}|${process.cwd()}`,
          'g',
        );
        const message = error.toString().replace(tmpDirPattern, '');
        stdError.push(message);
      });
    })
      .then((responseExecute) => responseExecute)
      .finally(() => {
        clearInterval(checkProcessUsageInterval);
        childProcess.kill('SIGKILL');
        this.tasks.delete(uuid);
      });
  }

  async clearAllProcesses() {
    this.tasks.forEach((process) => {
      if (process.killed === false) {
        process.kill('SIGKILL');
      }
    });

    this.tasks.clear();
  }
}

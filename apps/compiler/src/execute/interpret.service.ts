/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { Execute } from './execute.interface';
import { ProcessService } from '../process/process.service';
import { FileService } from '../file/file.service';
import * as path from 'path';
import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';
import { Logger } from 'winston';
import Config from '../config/config';
import { ConfigType } from '@nestjs/config';
import PreprocessError from './error/preprocess-error';
import RuntimeError from './error/runtime-error';
import TimeoutError from './error/timeout-error';

@Injectable()
export class InterpretService implements Execute {
  constructor(
    private readonly processService: ProcessService,
    private readonly fileService: FileService,
    @Inject('winston')
    private readonly logger: Logger,
    @Inject(Config.KEY)
    private readonly config: ConfigType<typeof Config>,
  ) {}

  getFileExtension(): string {
    return '';
  }
  getCompiledFileExtension(): string {
    return '';
  }
  getCompileCommand(): string {
    return '';
  }
  getCompileCommandArgs(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string[] {
    return [];
  }
  getExecuteCommand(): string {
    return '';
  }
  getExecuteCommandArgs(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string[] {
    return [];
  }

  async compile(code: string) {
    try {
      const tmpDir = await this.fileService.tmpDir(this.config.tmpDir);
      const fileExtension = this.getFileExtension()
        ? `.${this.getFileExtension()}`
        : '';
      const codePath = path.resolve(tmpDir, `main${fileExtension}`);
      await this.fileService.writeFile(codePath, '', code);
      return codePath;
    } catch (e) {
      throw new PreprocessError(e.message);
    } finally {
    }
  }

  async execute(code: string, input: string): Promise<ResponseExecuteDto> {
    const codePath = await this.compile(code);
    this.logger.silly('interpreter execute start');
    const tmpPath = path.dirname(codePath);

    try {
      const command = this.getExecuteCommand();
      const commandArgs = this.getExecuteCommandArgs(codePath, codePath, code);
      const options = {
        cwd: process.env.TMP_DIR,
      };

      const result = await this.processService.execute(
        command,
        commandArgs,
        options,
        input,
      );
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      if (tmpPath) {
        this.fileService.removeDir(tmpPath);
      }
    }
  }
  handleError(error: Error) {}
}

/* eslint-disable @typescript-eslint/no-unused-vars */

import * as path from 'path';
import { ProcessService } from '../process/process.service';
import { Execute } from './execute.interface';
import { Inject, Injectable } from '@nestjs/common';
import { FileService } from '../file/file.service';
import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';
import CompileError from './error/compile-error';
import RuntimeError from './error/runtime-error';
import { Logger } from 'winston';
import TimeoutError from './error/timeout-error';

@Injectable()
export class ExecuteService implements Execute {
  constructor(
    private readonly processService: ProcessService,
    private readonly fileService: FileService,
    @Inject('winston')
    private readonly logger: Logger,
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
  getExecuteCommand(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string {
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
    const tmpDir = await this.fileService.tmpDir(process.env.TMP_DIR);

    try {
      const fileExtension = this.getFileExtension()
        ? `.${this.getFileExtension()}`
        : '';
      const codePath = path.resolve(tmpDir, `Main${fileExtension}`);

      await this.fileService.writeFile(codePath, '', code);

      const compiledFileExtension = this.getCompiledFileExtension()
        ? `.${this.getCompiledFileExtension()}`
        : '';
      const compiledFilePath = path.resolve(
        tmpDir,
        `Main${compiledFileExtension}`,
      );

      const command = this.getCompileCommand();
      const commandArgs = this.getCompileCommandArgs(
        codePath,
        compiledFilePath,
        code,
      );

      const options = {
        cwd: process.env.TMP_DIR,
      };
      const result = await this.processService.execute(
        command,
        commandArgs,
        options,
      );

      return compiledFilePath;
    } catch (e) {
      this.fileService.removeDir(tmpDir);
      this.logger.error(e);
      throw new CompileError(e.message);
    } finally {
    }
  }

  async execute(code: string, input: string): Promise<ResponseExecuteDto> {
    const compiledFilePath = await this.compile(code);
    this.logger.silly(`end compile`);
    const tmpPath = path.dirname(compiledFilePath);

    const fileExtension = this.getFileExtension()
      ? `.${this.getFileExtension()}`
      : '';
    const filePath = path.resolve(tmpPath, `Main${fileExtension}`);

    try {
      this.logger.silly(`start process`);
      const command = this.getExecuteCommand(filePath, compiledFilePath, code);
      const commandArgs = this.getExecuteCommandArgs(
        filePath,
        compiledFilePath,
        code,
      );
      const options = {};

      this.logger.silly(`start execute`);
      const result = await this.processService.execute(
        command,
        commandArgs,
        options,
        input,
      );
      return result;
    } catch (e) {
      this.logger.error(`Execute Error occurred: ${e.message}`);
      this.logger.error(`Execute Error name: ${e.name}`);
      this.logger.error(`Execute Stack trace: ${e.stack}`);
      if (e instanceof TimeoutError) {
        throw e;
      }
      this.handleError(e);
      throw new RuntimeError('');
    } finally {
      this.fileService.removeDir(tmpPath);
    }
  }

  handleError(error: Error) {}
}

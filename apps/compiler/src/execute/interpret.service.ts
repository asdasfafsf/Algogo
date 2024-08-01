/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Execute } from './execute.interface';
import { ProcessService } from '../process/process.service';
import { FileService } from '../file/file.service';
import path from 'path';
import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';

@Injectable()
export class InterpretService implements Execute {
  constructor(
    private readonly processService: ProcessService,
    private readonly fileService: FileService,
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
    const tmpDir = await this.fileService.tmpDir(process.env.TMP_DIR);
    const fileExtension = this.getFileExtension()
      ? `.${this.getFileExtension()}`
      : '';
    const codePath = path.resolve(tmpDir, `main${fileExtension}`);
    await this.fileService.writeFile(codePath, '', code);

    return codePath;
  }

  async execute(code: string, input: string): Promise<ResponseExecuteDto> {
    const codePath = await this.compile(code);
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
    } catch (e) {
      throw new Error('Unexpected Error');
    } finally {
      this.fileService.removeDir(tmpPath);
    }
  }
}

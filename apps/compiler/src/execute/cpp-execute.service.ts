import { Injectable } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import RuntimeError from './error/runtime-error';

@Injectable()
export class CppExecuteService extends ExecuteService {
  getCompileCommand(): string {
    return 'g++';
  }

  getCompileCommandArgs(codePath: string, compiledPath: string): string[] {
    return [
      codePath,
      '-o',
      compiledPath,
      '-O2',
      '-Wall',
      '-lm',
      '-std=gnu++17',
      '-DONLINE_JUDGE',
      '-DBOJ',
    ];
  }

  getExecuteCommand(codePath: string, compiledPath: string): string {
    return compiledPath;
  }

  getExecuteCommandArgs(): string[] {
    return [];
  }

  getFileExtension(): string {
    return 'cc';
  }

  handleError(error: Error) {
    if (error.message === 'Segmentation fault') {
      throw new RuntimeError('Segmentation fault');
    } else if (
      error.message.includes('Buffer contains: This is a very long string')
    ) {
      throw new RuntimeError('BufferOverflow');
    }
    throw error;
  }
}

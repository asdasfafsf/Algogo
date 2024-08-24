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
    } else if (error.message.includes('Buffer contains: This is a')) {
      throw new RuntimeError('BufferOverflow');
    } else if (error.message.includes('free(): invalid pointer')) {
      throw new RuntimeError('InvalidPointer');
    } else if (error.message.includes('double free or corruption')) {
      throw new RuntimeError('DoubleFree');
    } else if (error.message.includes('malloc(): memory corruption')) {
      throw new RuntimeError('MemoryCorruption');
    } else if (error.message.includes('std::out_of_range')) {
      throw new RuntimeError('out_of_range');
    } else if (
      error.message.includes('attempt to decrement a past-the-end iterator')
    ) {
      throw new RuntimeError('PastTheEndIterator');
    }
    throw error;
  }
}

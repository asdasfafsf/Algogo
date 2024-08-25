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
      error.message.includes('Buffer contains: This is a') ||
      error.message.includes('buffer overflow detected')
    ) {
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
    } else if (error.message.includes('free(): invalid next size')) {
      throw new RuntimeError('InvalidNextSize');
    } else if (error.message.includes('std::bad_alloc')) {
      throw new RuntimeError('bad_alloc');
    } else if (error.message.includes('std::bad_array_new_length')) {
      throw new RuntimeError('bad_array_new_length');
    } else if (error.message.match(/Assertion\s+`([^']+)'\s+failed/)) {
      throw new RuntimeError('AssertionFailed');
    } else if (error.message === 'BusError') {
      throw new RuntimeError('BusError');
    } else if (error.message.includes('corrupted double-linked list')) {
      throw new RuntimeError('CorruptedList');
    } else if (
      error.message.toLowerCase().includes('floating point exception')
    ) {
      throw new RuntimeError('FloatingPointException');
    }
    throw error;
  }
}

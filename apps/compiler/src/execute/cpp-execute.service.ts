import { Injectable } from '@nestjs/common';
import { ExecuteService } from './execute.service';

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
      '-static',
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
}

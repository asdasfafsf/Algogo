import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';

@Injectable()
export class PythonInterpretService extends InterpretService {
  getFileExtension(): string {
    return 'py';
  }

  getCompileCommand() {
    return 'python3';
  }

  getCompileCommandArgs(codePath: string): string[] {
    return [
      '-W',
      'ignore',
      '-c',
      `import py_compile; py_compile.compile(r'${codePath}')`,
    ];
  }

  getExecuteCommand() {
    return 'python3';
  }

  getExecuteCommandArgs(codePath: string) {
    return ['-W', 'ignore', codePath];
  }
}

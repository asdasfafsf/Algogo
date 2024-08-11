import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';
import RuntimeError from './error/runtime-error';

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

  handleError(error: Error): void {
    if (error instanceof RuntimeError) {
      if (error.message.includes('RecursionError:')) {
        error.message = 'RecursionError';
      } else if (error.message.includes('ValueError:')) {
        error.message = 'ValueError';
      } else if (error.message.includes('IndexError:')) {
        error.message = 'IndexError';
      } else if (error.message.includes('NameError:')) {
        error.message = 'NameError';
      } else if (error.message.includes('TypeError:')) {
        error.message = 'TypeError';
      } else if (error.message.includes('AssertionError:')) {
        error.message = 'AssertionError';
      } else if (error.message.includes('FileNotFoundError:')) {
        error.message = 'FileNotFoundError';
      } else if (error.message.includes('SyntaxError:')) {
        error.message = 'SyntaxError';
      } else if (error.message.includes('AttributeError:')) {
        error.message = 'AttributeError';
      } else if (error.message.includes('ZeroDivisionError:')) {
        error.message = 'ZeroDivisionError';
      } else if (error.message.includes('ModuleNotFoundError:')) {
        error.message = 'ModuleNotFoundError';
      } else if (error.message.includes('UnboundLocalError:')) {
        error.message = 'UnboundLocalError';
      } else if (error.message.includes('OverflowError:')) {
        error.message = 'OverflowError';
      } else if (error.message.includes('EOFError:')) {
        error.message = 'EOFError';
      }
    }

    throw error;
  }
}

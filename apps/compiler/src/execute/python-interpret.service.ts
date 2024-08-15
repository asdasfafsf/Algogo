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
    if (error.message.includes('RecursionError:')) {
      throw new RuntimeError('RecursionError');
    } else if (error.message.includes('ValueError:')) {
      throw new RuntimeError('ValueError');
    } else if (error.message.includes('IndexError:')) {
      throw new RuntimeError('IndexError');
    } else if (error.message.includes('NameError:')) {
      throw new RuntimeError('NameError');
    } else if (error.message.includes('TypeError:')) {
      throw new RuntimeError('TypeError');
    } else if (error.message.includes('AssertionError:')) {
      throw new RuntimeError('AssertionError');
    } else if (error.message.includes('FileNotFoundError:')) {
      throw new RuntimeError('FileNotFoundError');
    } else if (error.message.includes('SyntaxError:')) {
      throw new RuntimeError('SyntaxError');
    } else if (error.message.includes('AttributeError:')) {
      throw new RuntimeError('AttributeError');
    } else if (error.message.includes('ZeroDivisionError:')) {
      throw new RuntimeError('ZeroDivisionError');
    } else if (error.message.includes('ModuleNotFoundError:')) {
      throw new RuntimeError('ModuleNotFoundError');
    } else if (error.message.includes('UnboundLocalError:')) {
      throw new RuntimeError('UnboundLocalError');
    } else if (error.message.includes('OverflowError:')) {
      throw new RuntimeError('OverflowError');
    } else if (error.message.includes('EOFError:')) {
      throw new RuntimeError('EOFError');
    }

    throw new RuntimeError('');
  }
}

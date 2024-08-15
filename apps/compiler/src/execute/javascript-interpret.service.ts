import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';
import RuntimeError from './error/runtime-error';

@Injectable()
export class JavascriptInterpretService extends InterpretService {
  getFileExtension(): string {
    return 'cjs';
  }

  getExecuteCommand() {
    return 'node';
  }

  getExecuteCommandArgs(codePath: string, compiledPath: string) {
    return [`--stack-size=${65535 >> 4}`, compiledPath];
  }

  handleError(error: Error) {
    if (error.message.includes('TypeError:')) {
      throw new RuntimeError('TypeError');
    } else if (error.message.includes('ReferenceError:')) {
      throw new RuntimeError('ReferenceError');
    } else if (error.message.includes('SyntaxError:')) {
      throw new RuntimeError('SyntaxError');
    } else if (error.message.includes('RangeError:')) {
      if (error.message.includes('stack size exceeded')) {
        throw new RuntimeError('StackSizeExceeded');
      } else {
        throw new RuntimeError('RangeError');
      }
    } else if (error.message.includes(`code: 'MODULE_NOT_FOUND'`)) {
      throw new RuntimeError('CannotFindModule');
    } else if (error.message.includes('ENOENT:')) {
      throw new RuntimeError('ENOENT');
    } else if (error.message.includes('EACCES:')) {
      throw new RuntimeError('EACCES');
    } else if (error.message.includes('ENOTDIR:')) {
      throw new RuntimeError('ENOTDIR');
    }

    throw new RuntimeError('');
  }
}

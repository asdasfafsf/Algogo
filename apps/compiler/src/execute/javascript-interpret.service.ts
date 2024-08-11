import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';
import { TimeoutError } from 'rxjs';
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
    return [`--stack-size=${65535 >> 2}`, compiledPath];
  }

  handleError(error: Error) {
    if (error instanceof TimeoutError) {
    } else if (error instanceof RuntimeError) {
      if (error.message.includes('TypeError:')) {
        error.message = 'TypeError';
      } else if (error.message.includes('ReferenceError:')) {
        error.message = 'ReferenceError';
      } else if (error.message.includes('SyntaxError:')) {
        error.message = 'SyntaxError';
      } else if (error.message.includes('RangeError:')) {
        if (error.message.includes('stack size exceeded')) {
          error.message = 'StackSizeExceeded';
        } else {
          error.message = 'RangeError';
        }
      } else if (error.message.includes(`code: 'MODULE_NOT_FOUND'`)) {
        error.message = 'CannotFindModule';
      } else if (error.message.includes('ENOENT:')) {
        error.message = 'ENOENT';
      } else if (error.message.includes('EACCES:')) {
        error.message = 'EACCES';
      } else if (error.message.includes('ENOTDIR:')) {
        error.message = 'ENOTDIR';
      }
    }

    throw error;
  }
}

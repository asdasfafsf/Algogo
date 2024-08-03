import { Injectable } from '@nestjs/common';
import { CppExecuteService } from './cpp-execute.service';

@Injectable()
export class ClangExecuteService extends CppExecuteService {
  getCompileCommand(): string {
    return 'clang++';
  }
}

import { Injectable } from '@nestjs/common';
import { InterpretService } from './interpret.service';

@Injectable()
export class JavascriptInterpretService extends InterpretService {
  getFileExtension(): string {
    return 'cjs';
  }

  getExecuteCommand() {
    return 'node';
  }

  getExecuteCommandArgs(codePath: string, compiledPath: string) {
    return ['--stack-size=65536', compiledPath];
  }
}

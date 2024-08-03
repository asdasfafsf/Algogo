import { Injectable } from '@nestjs/common';
import { JavaExecuteService } from './java-execute.service';

@Injectable()
export class Java17ExecuteService extends JavaExecuteService {
  getCompileCommandArgs(codePath: string): string[] {
    return [
      '--release',
      '17',
      '-J-Xms1024m',
      '-J-Xmx1920m',
      '-J-Xss512m',
      '-encoding',
      'UTF-8',
      codePath,
    ];
  }
}

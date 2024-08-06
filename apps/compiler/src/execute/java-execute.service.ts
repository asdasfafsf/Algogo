import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ExecuteService } from './execute.service';

@Injectable()
export class JavaExecuteService extends ExecuteService {
  getFileExtension() {
    return 'java';
  }
  getCompiledFileExtension() {
    return '';
  }
  getCompileCommand(): string {
    return 'javac';
  }
  getCompileCommandArgs(codePath: string): string[] {
    return [
      '--release',
      '11',
      '-J-Xms1024m',
      '-J-Xmx1920m',
      '-J-Xss512m',
      '-encoding',
      'UTF-8',
      codePath,
    ];
  }
  getExecuteCommand(): string {
    return 'java';
  }
  getExecuteCommandArgs(codePath: string): string[] {
    const tmpPath = path.dirname(codePath);
    return [
      '-cp',
      tmpPath,
      '-Xms1024m',
      '-Xmx1920m',
      '-Xss512m',
      '-Dfile.encoding=UTF-8',
      '-XX:+UseSerialGC',
      '-DONLINE_JUDGE=1',
      '-DBOJ=1',
      'Main',
    ];
  }
}

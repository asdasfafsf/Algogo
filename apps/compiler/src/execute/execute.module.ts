import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ProcessModule } from '../process/process.module';
import { InterpretService } from './interpret.service';
import { FileModule } from '../file/file.module';
import { PythonInterpretService } from './python-interpret.service';
import { JavascriptInterpretService } from './javascript-interpret.service';
import { JavaExecuteService } from './java-execute.service';
import { CppExecuteService } from './cpp-execute.service';
import { ClangExecuteService } from './clang-execute.service';
import { Java17ExecuteService } from './java17-execute.service';
import { RunService } from './run.service';
import executeProvider from './execute.provider';

@Module({
  imports: [ProcessModule, FileModule],
  providers: [
    ExecuteService,
    InterpretService,
    PythonInterpretService,
    JavascriptInterpretService,
    JavaExecuteService,
    CppExecuteService,
    ClangExecuteService,
    Java17ExecuteService,
    RunService,
    executeProvider,
  ],
  exports: [RunService],
})
export class ExecuteModule {}

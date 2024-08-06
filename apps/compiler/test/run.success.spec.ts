import { Test, TestingModule } from '@nestjs/testing';
import { RunService } from '../src/execute/run.service';
import { ExecuteModule } from '../src/execute/execute.module';
import executeProvider, {
  ExecuteProvider,
} from '../src/execute/execute.provider';
import { ConfigModule } from '@nestjs/config';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { ProcessModule } from '../src/process/process.module';
import { FileModule } from '../src/file/file.module';
import config from '../src/config/config';
import { join } from 'path';
import { ExecuteService } from '../src/execute/execute.service';
import { InterpretService } from '../src/execute/interpret.service';
import { PythonInterpretService } from '../src/execute/python-interpret.service';
import { JavascriptInterpretService } from '../src/execute/javascript-interpret.service';
import { JavaExecuteService } from '../src/execute/java-execute.service';
import { CppExecuteService } from '../src/execute/cpp-execute.service';
import { Java17ExecuteService } from '../src/execute/java17-execute.service';
import { ClangExecuteService } from '../src/execute/clang-execute.service';
import { successCodes } from './code/success';
import { cppCode } from './code/cpp.success';

describe('RunService', () => {
  let runService: RunService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
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
      imports: [
        ConfigModule.forRoot({
          envFilePath: [join(__dirname, '../src/config/env/.development.env')],
          isGlobal: true,
          load: [config],
        }),
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              level: 'info',
              format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike('MyApp', {
                  prettyPrint: true,
                }),
              ),
            }),
          ],
        }),
        ProcessModule,
        FileModule,
        ExecuteModule,
      ],
    }).compile();

    runService = module.get<RunService>(RunService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(runService).toBeDefined();
  });

  const providers: ExecuteProvider[] = [
    'java',
    'cpp',
    'clang',
    'java17',
    'javascript',
    'python',
  ];

  const testExecution = (
    provider: ExecuteProvider,
    code: string,
    input: string,
    expected: string,
  ) => {
    it(`should execute code for provider: ${provider}`, async () => {
      const executeResult = await runService.execute(provider, code, input);
      const { result } = executeResult;
      expect(result).toContain(expected);
    });
  };

  for (const provider of providers) {
    testExecution(
      provider,
      successCodes[provider],
      `hello ${provider}`,
      `hello ${provider}`,
    );
  }

  it('test of cpp', async () => {
    const input = `2\nGCF\nACDEB`;
    const responseCpp = await runService.execute('cpp', cppCode, input);
    expect(responseCpp.result).toBe('99437');
  });

  it('test of clang', async () => {
    const input = `2\nGCF\nACDEB`;
    const responseCpp = await runService.execute('clang', cppCode, input);
    expect(responseCpp.result).toBe('99437');
  });
});

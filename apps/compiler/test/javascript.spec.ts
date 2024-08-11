import { Test, TestingModule } from '@nestjs/testing';
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
import { JavascriptInterpretService } from '../src/execute/javascript-interpret.service';
import { promises as fs } from 'fs';
import TimeoutError from '../src/execute/error/timeout-error';
import RuntimeError from '../src/execute/error/runtime-error';

describe('JavascriptInterpretService', () => {
  let javascriptInterpretService: JavascriptInterpretService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [JavascriptInterpretService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: [join(__dirname, '../src/config/env/.development.env')],
          isGlobal: true,
          load: [config],
        }),
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              level: 'silly',
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
      ],
    }).compile();

    javascriptInterpretService = module.get<JavascriptInterpretService>(
      JavascriptInterpretService,
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('javascript service should be defined', () => {
    expect(javascriptInterpretService).toBeDefined();
  });

  const runTestWithErrorExpectation = async (
    sourceFileName: string,
    inputFileName: string,
    expectedError: any,
    errorMessageContains: string,
  ) => {
    const inputPath = join(__dirname, `code/javascript/${inputFileName}`);
    const sourcePath = join(__dirname, `code/javascript/${sourceFileName}`);

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await javascriptInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(expectedError);
      if (errorMessageContains) {
        expect(e.message).toBe(errorMessageContains);
      }
    }
  };

  it('should throw timeout error', async () => {
    await runTestWithErrorExpectation(
      'javascript.timeout.js',
      'javascript.timeout.input.txt',
      TimeoutError,
      '',
    );
  }, 10000);

  it('should throw runtime error', async () => {
    await runTestWithErrorExpectation(
      'javascript.runtime.error.js',
      'javascript.runtime.error.input.txt',
      RuntimeError,
      '',
    );
  }, 10000);

  // it('should throw segmentation fault error', async () => {
  //   await runTestWithErrorExpectation(
  //     'javascript.stackoverflow.js',
  //     'javascript.stackoverflow.input.txt',
  //     RuntimeError,
  //     'Segmentation fault',
  //   );
  // }, 10000);

  it('should throw type error', async () => {
    await runTestWithErrorExpectation(
      'javascript.type.error.js',
      'javascript.type.error.input.txt',
      RuntimeError,
      'TypeError',
    );
  }, 10000);

  it('should throw reference error', async () => {
    await runTestWithErrorExpectation(
      'javascript.reference.error.js',
      'javascript.reference.error.input.txt',
      RuntimeError,
      'ReferenceError',
    );
  }, 10000);

  it('should throw syntax error', async () => {
    await runTestWithErrorExpectation(
      'javascript.syntax.error.js',
      'javascript.syntax.error.input.txt',
      RuntimeError,
      'SyntaxError',
    );
  }, 10000);

  it('should throw range error', async () => {
    await runTestWithErrorExpectation(
      'javascript.range.error.js',
      'javascript.range.error.input.txt',
      RuntimeError,
      'RangeError',
    );
  }, 10000);

  it('should throw CannotFindModule', async () => {
    await runTestWithErrorExpectation(
      'javascript.CannotFindModule.js',
      'javascript.CannotFindModule.input.txt',
      RuntimeError,
      'CannotFindModule',
    );
  }, 10000);

  it('should throw stacksize', async () => {
    await runTestWithErrorExpectation(
      'javascript.stacksize.error.js',
      'javascript.stacksize.error.input.txt',
      RuntimeError,
      'StackSizeExceeded',
    );
  }, 50000);
});

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
import { promises as fs } from 'fs';
import TimeoutError from '../src/execute/error/timeout-error';
import RuntimeError from '../src/execute/error/runtime-error';
import { PythonInterpretService } from '../src/execute/python-interpret.service';

describe('pythonInterpretService', () => {
  let pythonInterpretService: PythonInterpretService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PythonInterpretService],
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

    pythonInterpretService = module.get<PythonInterpretService>(
      PythonInterpretService,
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('python be defined', () => {
    expect(pythonInterpretService).toBeDefined();
  });

  const runTestWithErrorExpectation = async (
    sourceFileName: string,
    inputFileName: string,
    expectedError: any,
    errorMessageContains?: string,
  ) => {
    const inputPath = join(__dirname, `code/python/${inputFileName}`);
    const sourcePath = join(__dirname, `code/python/${sourceFileName}`);

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await pythonInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(expectedError);
      if (errorMessageContains) {
        expect(e.message).toBe(errorMessageContains);
      }
    }
  };

  it('python timeout error', async () => {
    await runTestWithErrorExpectation(
      'python.timeout.py',
      'python.timeout.input.txt',
      TimeoutError,
      '',
    );
  }, 10000);

  it('python runtime error', async () => {
    await runTestWithErrorExpectation(
      'python.runtime.error.py',
      'python.runtime.error.input.txt',
      RuntimeError,
    );
  }, 10000);

  it('python recursion', async () => {
    await runTestWithErrorExpectation(
      'python.stackoverflow.py',
      'python.stackoverflow.input.txt',
      RuntimeError,
      'RecursionError',
    );
  }, 10000);

  it('python ValueError', async () => {
    await runTestWithErrorExpectation(
      'python.value.error.py',
      'python.value.error.input.txt',
      RuntimeError,
      'ValueError',
    );
  }, 10000);

  it('python IndexError', async () => {
    await runTestWithErrorExpectation(
      'python.index.error.py',
      'python.index.error.input.txt',
      RuntimeError,
      'IndexError',
    );
  }, 10000);

  it('python NameError', async () => {
    await runTestWithErrorExpectation(
      'python.name.error.py',
      'python.name.error.input.txt',
      RuntimeError,
      'NameError',
    );
  }, 10000);

  it('python TypeError', async () => {
    await runTestWithErrorExpectation(
      'python.type.error.py',
      'python.type.error.input.txt',
      RuntimeError,
      'TypeError',
    );
  }, 10000);

  it('python AssertionError', async () => {
    await runTestWithErrorExpectation(
      'python.assertion.error.py',
      'python.assertion.error.input.txt',
      RuntimeError,
      'AssertionError',
    );
  }, 10000);

  it('python FileNotFoundError', async () => {
    await runTestWithErrorExpectation(
      'python.filenotfound.error.py',
      'python.filenotfound.error.input.txt',
      RuntimeError,
      'FileNotFoundError',
    );
  }, 10000);

  it('python SyntaxError', async () => {
    await runTestWithErrorExpectation(
      'python.syntax.error.py',
      'python.syntax.error.input.txt',
      RuntimeError,
      'SyntaxError',
    );
  }, 10000);

  it('python AttributeError', async () => {
    await runTestWithErrorExpectation(
      'python.attribute.error.py',
      'python.attribute.error.input.txt',
      RuntimeError,
      'AttributeError',
    );
  }, 10000);

  it('python ZeroDivisionError', async () => {
    await runTestWithErrorExpectation(
      'python.zerodivision.error.py',
      'python.zerodivision.error.input.txt',
      RuntimeError,
      'ZeroDivisionError',
    );
  }, 10000);

  it('python ModuleNotFoundError', async () => {
    await runTestWithErrorExpectation(
      'python.modulenotfound.error.py',
      'python.modulenotfound.error.input.txt',
      RuntimeError,
      'ModuleNotFoundError',
    );
  }, 10000);

  it('python UnboundLocalError', async () => {
    await runTestWithErrorExpectation(
      'python.unboundlocal.error.py',
      'python.unboundlocal.error.input.txt',
      RuntimeError,
      'UnboundLocalError',
    );
  }, 10000);

  it('python OverflowError', async () => {
    await runTestWithErrorExpectation(
      'python.overflow.error.py',
      'python.overflow.error.input.txt',
      RuntimeError,
      'OverflowError',
    );
  }, 10000);
});

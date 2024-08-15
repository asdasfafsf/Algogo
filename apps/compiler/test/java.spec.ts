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
import { JavaExecuteService } from '../src/execute/java-execute.service';
import TimeoutError from '../src/execute/error/timeout-error';
import RuntimeError from '../src/execute/error/runtime-error';
import CompileError from '../src/execute/error/compile-error';

describe('javaExecuteService', () => {
  let javaExecuteService: JavaExecuteService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [JavaExecuteService],
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

    javaExecuteService = module.get<JavaExecuteService>(JavaExecuteService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('java service should be defined', () => {
    expect(javaExecuteService).toBeDefined();
  });

  const runTestWithErrorExpectation = async (
    sourceFileName: string,
    inputFileName: string,
    expectedError: any,
    errorMessageContains?: string,
  ) => {
    const inputPath = join(__dirname, `code/java/${inputFileName}`);
    const sourcePath = join(__dirname, `code/java/${sourceFileName}`);

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await javaExecuteService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(expectedError);
      if (errorMessageContains) {
        expect(e.message).toBe(errorMessageContains);
      }
    }
  };

  // it('java NoSuchElementException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.nosuchelement.error.java',
  //     'java.nosuchelement.error.input.txt',
  //     RuntimeError,
  //     'NoSuchElementException',
  //   );
  // }, 10000);

  // it('java InputMismatchException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.inputmismatch.error.java',
  //     'java.inputmismatch.error.input.txt',
  //     RuntimeError,
  //     'InputMismatchException',
  //   );
  // }, 10000);

  // it('java NumberFormatException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.numberformat.error.java',
  //     'java.numberformat.error.input.txt',
  //     RuntimeError,
  //     'NumberFormatException',
  //   );
  // }, 10000);

  // it('java IndexOutOfBoundsException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.indexoutofbounds.error.java',
  //     'java.indexoutofbounds.error.input.txt',
  //     RuntimeError,
  //     'IndexOutOfBoundsException',
  //   );
  // }, 10000);

  // it('java ArrayIndexOutOfBoundsException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.arrayindexoutofbounds.error.java',
  //     'java.arrayindexoutofbounds.error.input.txt',
  //     RuntimeError,
  //     'ArrayIndexOutOfBoundsException',
  //   );
  // }, 10000);

  // it('java StringIndexOutOfBoundsException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.stringindexoutofbounds.error.java',
  //     'java.stringindexoutofbounds.error.input.txt',
  //     RuntimeError,
  //     'StringIndexOutOfBoundsException',
  //   );
  // }, 10000);

  // it('java ArithmeticException by zero', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.by zero.error.java',
  //     'java.by zero.error.input.txt',
  //     RuntimeError,
  //     'ArithmeticException: divide by zero',
  //   );
  // }, 10000);

  // it('java ArithmeticException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.arithmetic.error.java',
  //     'java.arithmetic.error.input.txt',
  //     RuntimeError,
  //     'ArithmeticException',
  //   );
  // }, 10000);

  it('java StackOverflowError', async () => {
    await runTestWithErrorExpectation(
      'java.stackoverflow.error.java',
      'java.stackoverflow.error.input.txt',
      RuntimeError,
      'StackOverflowError',
    );
  }, 50000);

  // it('java FileNotFoundException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.filenotfound.error.java',
  //     'java.filenotfound.error.input.txt',
  //     RuntimeError,
  //     'FileNotFoundException',
  //   );
  // }, 10000);

  // it('java NullPointerException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.nullpointer.error.java',
  //     'java.nullpointer.error.input.txt',
  //     RuntimeError,
  //     'NullPointerException',
  //   );
  // }, 10000);

  // it('java IOException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.io.error.java',
  //     'java.io.error.input.txt',
  //     RuntimeError,
  //     'IOException',
  //   );
  // }, 10000);

  // it('java IllegalArgumentException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.illegalargument.error.java',
  //     'java.illegalargument.error.input.txt',
  //     RuntimeError,
  //     'IllegalArgumentException',
  //   );
  // }, 10000);

  // it('java EmptyStackException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.emptystack.error.java',
  //     'java.emptystack.error.input.txt',
  //     RuntimeError,
  //     'EmptyStackException',
  //   );
  // }, 10000);

  // it('java IllegalFormatException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.illegalformat.error.java',
  //     'java.illegalformat.error.input.txt',
  //     RuntimeError,
  //     'IllegalFormatConversionException',
  //   );
  // }, 10000);

  // it('java AccessControlException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.accesscontrol.error.java',
  //     'java.accesscontrol.error.input.txt',
  //     RuntimeError,
  //     'AccessControlException',
  //   );
  // }, 10000);

  // it('java NegativeArraySizeException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.negativearraysize.error.java',
  //     'java.negativearraysize.error.input.txt',
  //     RuntimeError,
  //     'NegativeArraySizeException',
  //   );
  // }, 10000);

  // it('java IllegalStateException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.illegalstate.error.java',
  //     'java.illegalstate.error.input.txt',
  //     RuntimeError,
  //     'IllegalStateException',
  //   );
  // }, 10000);

  // it('java UnknownFormatConversionException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.unknownformat.error.java',
  //     'java.unknownformat.error.input.txt',
  //     RuntimeError,
  //     'UnknownFormatConversionException',
  //   );
  // }, 10000);

  // it('java ConcurrentModificationException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.concurrentmodification.error.java',
  //     'java.concurrentmodification.error.input.txt',
  //     RuntimeError,
  //     'ConcurrentModificationException',
  //   );
  // }, 10000);

  // it('java ClassCastException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.classcast.error.java',
  //     'java.classcast.error.input.txt',
  //     RuntimeError,
  //     'ClassCastException',
  //   );
  // }, 10000);

  // it('java ArrayStoreException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.arraystore.error.java',
  //     'java.arraystore.error.input.txt',
  //     RuntimeError,
  //     'ArrayStoreException',
  //   );
  // }, 10000);

  // it('java UnsupportedOperationException', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.unsupported.error.java',
  //     'java.unsupported.error.input.txt',
  //     RuntimeError,
  //     'UnsupportedOperationException',
  //   );
  // }, 10000);

  // it('java No main method', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.no main.error.java',
  //     'java.no main.error.input.txt',
  //     RuntimeError,
  //     'Main method not found',
  //   );
  // }, 10000);

  // it('java static main', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.static main.error.java',
  //     'java.static main.error.input.txt',
  //     RuntimeError,
  //     'Main method is not static',
  //   );
  // }, 10000);

  // it('java void main', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.void main.error.java',
  //     'java.void main.error.input.txt',
  //     RuntimeError,
  //     'Main method must return a value of type void',
  //   );
  // }, 10000);

  // it('java main class not found', async () => {
  //   await runTestWithErrorExpectation(
  //     'java.main class main.error.java',
  //     'java.main class main.error.input.txt',
  //     CompileError,
  //   );
  // }, 10000);
});

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
import { CppExecuteService } from '../src/execute/cpp-execute.service';
import { promises as fs } from 'fs';
import TimeoutError from '../src/execute/error/timeout-error';
import RuntimeError from '../src/execute/error/runtime-error';

describe('CppExecuteService - Error Tests', () => {
  let cppExecuteService: CppExecuteService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [CppExecuteService],
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

    cppExecuteService = module.get<CppExecuteService>(CppExecuteService);
  });

  afterAll(async () => {
    await module.close();
  });

  const runTestWithErrorExpectation = async (
    sourceFileName: string,
    expectedError: any,
    errorMessageContains: string,
  ) => {
    const sourcePath = join(__dirname, `code/cpp/${sourceFileName}`);
    const inputPath = join(
      __dirname,
      `code/cpp/${sourceFileName.split('.').slice(0, -1).join('.')}.input.txt`,
    );
    const source = await fs.readFile(sourcePath, 'utf-8');
    const input = await fs.readFile(inputPath, 'utf-8');
    try {
      await cppExecuteService.execute(source, input);
      throw new Error('');
    } catch (e) {
      expect(e).toBeInstanceOf(expectedError);
      if (errorMessageContains) {
        expect(e.message).toContain(errorMessageContains);
      }
    }

    // throw new Error('exception not occured');
  };

  // it('should throw segfault error', async () => {
  //   await runTestWithErrorExpectation(
  //     'segfault.cpp',
  //     RuntimeError,
  //     'Segmentation fault',
  //   );
  // }, 10000);

  // it('should throw buffer overflow error', async () => {
  //   await runTestWithErrorExpectation(
  //     'buffer.overflow.cpp',
  //     RuntimeError,
  //     'BufferOverflow',
  //   );
  // }, 10000);

  // it('should throw division by zero error', async () => {
  //   await runTestWithErrorExpectation(
  //     'division.by.zero.cpp',
  //     RuntimeError,
  //     'Division by zero',
  //   );
  // }, 10000);

  // it('should throw double free error', async () => {
  //   await runTestWithErrorExpectation(
  //     'double.free.cpp',
  //     RuntimeError,
  //     'DoubleFree',
  //   );
  // }, 10000);

  // it('should throw invalid pointer error', async () => {
  //   await runTestWithErrorExpectation(
  //     'invalid.pointer.cpp',
  //     RuntimeError,
  //     'InvalidPointer',
  //   );
  // }, 10000);

  // it('should throw memory corruption error', async () => {
  //   await runTestWithErrorExpectation(
  //     'memory.corruption.cpp',
  //     RuntimeError,
  //     'Memory corruption',
  //   );
  // }, 10000);

  // it('should throw out of bounds error', async () => {
  //   await runTestWithErrorExpectation(
  //     'out.of.bounds.cpp',
  //     RuntimeError,
  //     'Out of bounds',
  //   );
  // }, 10000);

  // it('should throw out of range error', async () => {
  //   await runTestWithErrorExpectation(
  //     'out.of.range.cpp',
  //     RuntimeError,
  //     'out_of_range',
  //   );
  // }, 10000);

  // it('should throw past the end iterator error', async () => {
  //   await runTestWithErrorExpectation(
  //     'past.the.end.iterator.cpp',
  //     RuntimeError,
  //     'Past-the-end iterator',
  //   );
  // }, 10000);

  // it('should throw invalid next size error', async () => {
  //   await runTestWithErrorExpectation(
  //     'invalid.next.size.cpp',
  //     RuntimeError,
  //     'Invalid next size',
  //   );
  // }, 10000);

  // it('should throw bad alloc error', async () => {
  //   await runTestWithErrorExpectation(
  //     'bad.alloc.cpp',
  //     RuntimeError,
  //     'bad_alloc',
  //   );
  // }, 10000);

  // it('should throw bad array new length error', async () => {
  //   await runTestWithErrorExpectation(
  //     'bad.array.new.length.cpp',
  //     RuntimeError,
  //     'bad_array_new_length',
  //   );
  // }, 10000);

  // it('should throw assertion failed error', async () => {
  //   await runTestWithErrorExpectation(
  //     'assertion.failed.cpp',
  //     RuntimeError,
  //     'AssertionFailed',
  //   );
  // }, 10000);

  // it('should throw access null pointer error', async () => {
  //   await runTestWithErrorExpectation(
  //     'access.null.pointer.cpp',
  //     RuntimeError,
  //     'Access null pointer',
  //   );
  // }, 10000);

  // it('should throw bus error', async () => {
  //   await runTestWithErrorExpectation(
  //     'bus.error.cpp',
  //     RuntimeError,
  //     'Bus error',
  //   );
  // }, 10000);

  // it('should throw misaligned address error', async () => {
  //   await runTestWithErrorExpectation(
  //     'misaligned.address.cpp',
  //     RuntimeError,
  //     'Misaligned address',
  //   );
  // }, 10000);

  // it('should throw never be null error', async () => {
  //   await runTestWithErrorExpectation(
  //     'never.be.null.cpp',
  //     RuntimeError,
  //     'Null pointer dereference',
  //   );
  // }, 10000);

  // it('should throw corrupted list error', async () => {
  //   await runTestWithErrorExpectation(
  //     'corrupted.list.cpp',
  //     RuntimeError,
  //     'Corrupted list',
  //   );
  // }, 10000);

  // it('should throw store to null pointer error', async () => {
  //   await runTestWithErrorExpectation(
  //     'store.to.null.pointer.cpp',
  //     RuntimeError,
  //     'Store to null pointer',
  //   );
  // }, 10000);

  // it('should throw floating point exception error', async () => {
  //   await runTestWithErrorExpectation(
  //     'floating.point.exception.cpp',
  //     RuntimeError,
  //     'Floating point exception',
  //   );
  // }, 10000);

  // it('should throw insufficient space error', async () => {
  //   await runTestWithErrorExpectation(
  //     'insufficient.space.cpp',
  //     RuntimeError,
  //     'Insufficient space',
  //   );
  // }, 10000);

  // it('should throw integer overflow error', async () => {
  //   await runTestWithErrorExpectation(
  //     'integer.overflow.cpp',
  //     RuntimeError,
  //     'Integer overflow',
  //   );
  // }, 10000);

  // it('should throw shift exponent error', async () => {
  //   await runTestWithErrorExpectation(
  //     'shift.exponent.cpp',
  //     RuntimeError,
  //     'Shift exponent',
  //   );
  // }, 10000);

  // it('should throw without returning error', async () => {
  //   await runTestWithErrorExpectation(
  //     'without.returning.cpp',
  //     RuntimeError,
  //     'Function did not return a value',
  //   );
  // }, 10000);
});

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

  it('python timeout error', async () => {
    const inputPath = join(__dirname, 'code/python/python.timeout.input.txt');
    const sourcePath = join(__dirname, 'code/python/python.timeout.py');

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await pythonInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
    }
  }, 10000);

  it('python runtime error', async () => {
    const inputPath = join(
      __dirname,
      'code/python/python.runtime.error.input.txt',
    );
    const sourcePath = join(__dirname, 'code/python/python.runtime.error.py');

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await pythonInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(RuntimeError);
    }
  }, 10000);

  it('python segfault', async () => {
    const inputPath = join(
      __dirname,
      'code/python/python.stackoverflow.input.txt',
    );
    const sourcePath = join(__dirname, 'code/python/python.stackoverflow.py');

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await pythonInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(RuntimeError);
      expect(e.message).toContain('Segmentation fault');
    }
  }, 10000);
});

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
      ],
    }).compile();

    javascriptInterpretService = module.get<JavascriptInterpretService>(
      JavascriptInterpretService,
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('javascript be defined', () => {
    expect(javascriptInterpretService).toBeDefined();
  });

  it('javascript timeout error', async () => {
    // 상대 경로 설정
    const inputPath = join(
      __dirname,
      'code/javascript/javascript.timeout.input.txt',
    );
    const sourcePath = join(__dirname, 'code/javascript/javascript.timeout.js');

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await javascriptInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
    }
  }, 10000);

  it('javascript runtime error', async () => {
    const inputPath = join(
      __dirname,
      'code/javascript/javascript.runtime.error.input.txt',
    );
    const sourcePath = join(
      __dirname,
      'code/javascript/javascript.runtime.error.js',
    );

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await javascriptInterpretService.execute(source, input);
    } catch (e) {
      expect(e).toBeInstanceOf(RuntimeError);
    }
  }, 10000);

  it('javascript segfault', async () => {
    const inputPath = join(
      __dirname,
      'code/javascript/javascript.stackoverflow.input.txt',
    );
    const sourcePath = join(
      __dirname,
      'code/javascript/javascript.stackoverflow.js',
    );

    const input = await fs.readFile(inputPath, 'utf-8');
    const source = await fs.readFile(sourcePath, 'utf-8');

    try {
      await javascriptInterpretService.execute(source, input);
    } catch (e) {
      console.log(e.message);
      expect(e).toBeInstanceOf(RuntimeError);
      expect(e.message).toContain('Segmentation fault');
    }
  }, 10000);
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ProblemsService } from '../src/problems/problems.service';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { PrismaModule } from '../src/prisma/prisma.module';
import { ProblemsRepository } from '../src/problems/problems.repository';

describe('ProblemsService', () => {
  let service: ProblemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemsService, ProblemsRepository],
      imports: [
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
        ConfigModule.forRoot({
          envFilePath: [join(__dirname, '../src/config/env/.development.env')],
          isGlobal: true,
          load: [],
        }),
        PrismaModule,
      ],
    }).compile();

    service = module.get<ProblemsService>(ProblemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('get problems', async () => {
    const pageNo = 1;
    const pageSize = 10;
    const levelList = [] as number[];
    const typeList = ['구현'] as string[];
    const problemSummaryList = await service.getProblemSummaryList({
      pageNo,
      pageSize,
      levelList,
      typeList,
    });
    const containsSourceId1001 = problemSummaryList.some(
      (problem) => problem.sourceId === '1001',
    );
    expect(containsSourceId1001).toBe(true);
  });
});

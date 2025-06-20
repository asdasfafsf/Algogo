import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsReportService } from './problems-report.service';

describe('ProblemsReportService', () => {
  let service: ProblemsReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemsReportService],
    }).compile();

    service = module.get<ProblemsReportService>(ProblemsReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

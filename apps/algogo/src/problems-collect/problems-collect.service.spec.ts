import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsCollectService } from './problems-collect.service';

describe('ProblemsCollectService', () => {
  let service: ProblemsCollectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemsCollectService],
    }).compile();

    service = module.get<ProblemsCollectService>(ProblemsCollectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

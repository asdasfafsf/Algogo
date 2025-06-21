import { Test, TestingModule } from '@nestjs/testing';
import { ProblemSiteService } from './problem-site.service';

describe('ProblemSiteService', () => {
  let service: ProblemSiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemSiteService],
    }).compile();

    service = module.get<ProblemSiteService>(ProblemSiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

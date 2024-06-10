import { Test, TestingModule } from '@nestjs/testing';
import { ProblemCrawlerService } from './problem-crawler.service';

describe('ProblemCrawlerService', () => {
  let service: ProblemCrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemCrawlerService],
    }).compile();

    service = module.get<ProblemCrawlerService>(ProblemCrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

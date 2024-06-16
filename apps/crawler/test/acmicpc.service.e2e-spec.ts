import { Test, TestingModule } from '@nestjs/testing';
import { AcmicpcService } from '../src/problem-crawler/acmicpc.service';

describe('AcmicpcService', () => {
  let service: AcmicpcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcmicpcService],
    }).compile();

    service = module.get<AcmicpcService>(AcmicpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

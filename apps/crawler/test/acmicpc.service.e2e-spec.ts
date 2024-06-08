import { Test, TestingModule } from '@nestjs/testing';
import { AcmicpcService } from '../problem-crawler/acmicpc.service';

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

  it('test', async () => {
    console.log('야 왜 실행안돼');
    await service.getProblem('1000');
  });
});

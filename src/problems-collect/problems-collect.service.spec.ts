import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsCollectService } from './problems-collect.service';
import { ProblemsCollectRepository } from './problems-collect.repository';
import { RedisService } from '../redis/redis.service';
import { CrawlerService } from '../crawler/crawler.service';
import { ImageService } from '../image/image.service';
import { S3Service } from '../s3/s3.service';
import { CustomLogger } from '../logger/custom-logger';
import { NotImplementedException } from '../common/errors/NotImplementedException';

describe('ProblemsCollectService', () => {
  let service: ProblemsCollectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsCollectService,
        { provide: ProblemsCollectRepository, useValue: {} },
        { provide: RedisService, useValue: {} },
        { provide: CrawlerService, useValue: {} },
        { provide: ImageService, useValue: {} },
        { provide: S3Service, useValue: {} },
        { provide: CustomLogger, useValue: { debug: jest.fn() } },
      ],
    }).compile();

    service = module.get(ProblemsCollectService);
  });

  describe('collect', () => {
    it('미구현 상태이므로 NotImplementedException을 던진다', async () => {
      // When & Then
      await expect(
        service.collect({ url: 'https://www.acmicpc.net/problem/1000', userNo: 'user-1' }),
      ).rejects.toThrow(NotImplementedException);
    });
  });
});

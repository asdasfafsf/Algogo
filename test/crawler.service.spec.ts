import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerService } from '../src/crawler/crawler.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import crawlerConfig from '../src/config/crawlerConfig';

describe('CrawlerService', () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
      imports: [
        ConfigModule.forRoot({
          envFilePath: [join(__dirname, '../src/config/env/.development.env')],
          isGlobal: true,
          load: [crawlerConfig],
        }),
        HttpModule,
      ],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('resource', async () => {
    const response = await service.getResource(
      'https://onlinejudgeimages.s3-ap-northeast-1.amazonaws.com/upload/images/sticker.png',
    );

    expect(response.statusCode).toBe(200);
  });
});

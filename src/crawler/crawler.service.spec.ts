import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerService } from './crawler.service';
import { HttpService } from '@nestjs/axios';
import crawlerConfig from '../config/crawlerConfig';
import { of } from 'rxjs';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        { provide: 'winston', useValue: { info: jest.fn(), error: jest.fn() } },
        { provide: crawlerConfig.KEY, useValue: { url: 'http://crawler:3000' } },
      ],
    }).compile();

    service = module.get(CrawlerService);
    httpService = module.get(HttpService) as jest.Mocked<HttpService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProblem', () => {
    it('크롤러에서 문제 데이터를 가져온다', async () => {
      // Given
      const mockResponse = {
        data: {
          statusCode: 200,
          errorCode: '0000',
          errorMessage: '',
          data: {
            title: '테스트 문제',
            contentList: [{ type: 'text', content: '내용', cellList: undefined }],
          },
        },
      };
      httpService.get.mockReturnValue(of(mockResponse) as never);

      // When
      const result = await service.getProblem('BOJ', '1000');

      // Then
      expect(result.errorCode).toBe('0000');
      expect(result.data.contentList[0].cellList).toEqual([]);
    });
  });
});

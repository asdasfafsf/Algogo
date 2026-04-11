import { Test, TestingModule } from '@nestjs/testing';
import { ProblemSiteService } from './problem-site.service';
import { ProblemSiteRepository } from './problem-site.repository';

describe('ProblemSiteService', () => {
  let service: ProblemSiteService;
  let repository: jest.Mocked<ProblemSiteRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemSiteService,
        {
          provide: ProblemSiteRepository,
          useValue: { createProblemSite: jest.fn(), deleteProblemSite: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ProblemSiteService);
    repository = module.get(ProblemSiteRepository) as jest.Mocked<ProblemSiteRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProblemSite', () => {
    it('repository에 위임한다', async () => {
      // Given
      const params = { userUuid: 'user-1', provider: 'BOJ' as const, handle: 'testuser' };
      repository.createProblemSite.mockResolvedValue(params as never);

      // When
      await service.createProblemSite(params);

      // Then
      expect(repository.createProblemSite).toHaveBeenCalledWith(params);
    });
  });

  describe('deleteProblemSite', () => {
    it('repository에 위임한다', async () => {
      // Given
      const params = { userUuid: 'user-1', provider: 'BOJ' as const };
      repository.deleteProblemSite.mockResolvedValue(undefined as never);

      // When
      await service.deleteProblemSite(params);

      // Then
      expect(repository.deleteProblemSite).toHaveBeenCalledWith(params);
    });
  });
});

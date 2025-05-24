import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsV2Service } from './problems-v2.service';
import { ProblemsV2Repository } from './problems-v2.repository';
import { CustomNotFoundException } from '../common/errors/CustomNotFoundException';
import { PROBLEM_SORT_MAP } from './constants/problems-sort';

describe('ProblemsV2Service', () => {
  let service: ProblemsV2Service;
  let repository: ProblemsV2Repository;

  beforeEach(async () => {
    const mockRepository = {
      getProblemsSummary: jest.fn(),
      getProblem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsV2Service,
        {
          provide: ProblemsV2Repository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProblemsV2Service>(ProblemsV2Service);
    repository = module.get<ProblemsV2Repository>(ProblemsV2Repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProblemsSummary', () => {
    it('리포지토리의 getProblemsSummary 메소드를 올바른 파라미터로 호출해야 함', async () => {
      const dto = {
        pageNo: 1,
        pageSize: 10,
        sort: PROBLEM_SORT_MAP.DEFAULT,
      };
      await service.getProblemsSummary(dto);
      expect(repository.getProblemsSummary).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProblem', () => {
    it('리포지토리의 getProblem 메소드를 올바른 UUID로 호출해야 함', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      jest.spyOn(repository, 'getProblem').mockResolvedValue({ uuid } as any);

      await service.getProblem(uuid);
      expect(repository.getProblem).toHaveBeenCalledWith(uuid);
    });

    it('리포지토리가 null을 반환하면 CustomNotFoundException을 던져야 함', async () => {
      const uuid = 'non-existent-uuid';
      jest.spyOn(repository, 'getProblem').mockResolvedValue(null);

      await expect(service.getProblem(uuid)).rejects.toThrow(
        CustomNotFoundException,
      );
      expect(repository.getProblem).toHaveBeenCalledWith(uuid);
    });
  });
});

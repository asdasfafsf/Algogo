import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsService } from './problems.service';
import { ProblemsRepository } from './problems.repository';
import { CustomLogger } from '../logger/custom-logger';
import { ProblemNotFoundException } from '../common/errors/problem/ProblemNotFoundException';
import { PROBLEM_SORT } from '../common/constants/problem-sort.constant';

describe('ProblemsService', () => {
  let service: ProblemsService;
  let repository: jest.Mocked<ProblemsRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getProblemList: jest.fn(),
      getProblem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsService,
        { provide: ProblemsRepository, useValue: mockRepository },
        { provide: CustomLogger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get(ProblemsService);
    repository = module.get(ProblemsRepository) as jest.Mocked<ProblemsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProblemSummaryList', () => {
    it('문제 목록을 반환한다', async () => {
      // Given
      const mockResult = {
        problemList: [{ uuid: '1', title: '테스트', typeList: [{ name: '수학' }] }],
        totalCount: 1,
        pageSize: 10,
        pageNo: 1,
      };
      repository.getProblemList.mockResolvedValue(mockResult as never);

      // When
      const result = await service.getProblemSummaryList({
        sort: PROBLEM_SORT.DEFAULT,
      } as never);

      // Then
      expect(result.totalCount).toBe(1);
      expect(result.problemList[0].typeList).toEqual(['수학']);
    });
  });

  describe('getProblem', () => {
    it('문제가 존재하면 반환한다', async () => {
      // Given
      const problem = { uuid: '1', title: '테스트', contentList: [] };
      repository.getProblem.mockResolvedValue(problem as never);

      // When
      const result = await service.getProblem('1');

      // Then
      expect(result.uuid).toBe('1');
    });

    it('문제가 없으면 ProblemNotFoundException을 던진다', async () => {
      // Given
      repository.getProblem.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getProblem('none')).rejects.toThrow(ProblemNotFoundException);
    });
  });
});

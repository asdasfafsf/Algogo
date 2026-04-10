import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsService } from './problems.service';
import { ProblemsRepository } from './problems.repository';
import { AppLogger } from '../logger/app-logger';
import { ProblemNotFoundException } from '../common/errors/problem/ProblemNotFoundException';
import { PROBLEM_SORT } from '../common/constants/problem-sort.constant';

describe('ProblemsService', () => {
  let service: ProblemsService;
  let repository: jest.Mocked<ProblemsRepository>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsService,
        {
          provide: ProblemsRepository,
          useValue: { getProblemList: jest.fn(), getProblem: jest.fn() },
        },
        { provide: AppLogger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get(ProblemsService);
    repository = module.get(ProblemsRepository) as jest.Mocked<ProblemsRepository>;
    logger = module.get(AppLogger) as jest.Mocked<AppLogger>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProblemSummaryList', () => {
    const mockResult = {
      problemList: [
        { uuid: '1', title: '문제1', typeList: [{ name: '수학' }, { name: '구현' }] },
        { uuid: '2', title: '문제2', typeList: [] },
      ],
      totalCount: 2,
      pageSize: 10,
      pageNo: 1,
    };

    it('문제 목록을 조회하고 typeList를 문자열 배열로 매핑한다', async () => {
      // Given
      repository.getProblemList.mockResolvedValue(mockResult as never);

      // When
      const result = await service.getProblemSummaryList({
        pageNo: 1, pageSize: 10, sort: PROBLEM_SORT.DEFAULT,
      } as never);

      // Then
      expect(result.totalCount).toBe(2);
      expect(result.problemList[0].typeList).toEqual(['수학', '구현']);
      expect(result.problemList[1].typeList).toEqual([]);
    });

    it('pageNo/pageSize 미지정 시 기본값 1/10을 사용한다', async () => {
      // Given
      repository.getProblemList.mockResolvedValue(mockResult as never);

      // When
      await service.getProblemSummaryList({ sort: PROBLEM_SORT.DEFAULT } as never);

      // Then
      expect(repository.getProblemList).toHaveBeenCalledWith(
        1, 10, PROBLEM_SORT.DEFAULT, undefined, undefined, undefined,
      );
    });

    it('repository 에러 시 로깅 후 에러를 재전파한다', async () => {
      // Given
      const error = new Error('DB error');
      repository.getProblemList.mockRejectedValue(error);

      // When & Then
      await expect(
        service.getProblemSummaryList({ sort: PROBLEM_SORT.DEFAULT } as never),
      ).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalledWith(
        'ProblemsService getProblemSummaryList',
        { message: 'DB error' },
      );
    });
  });

  describe('getProblem', () => {
    it('문제가 존재하면 contentList를 매핑하여 반환한다', async () => {
      // Given
      const problem = {
        uuid: '1',
        title: '테스트',
        contentList: [{ type: 'text', content: '내용', cellList: [] }],
      };
      repository.getProblem.mockResolvedValue(problem as never);

      // When
      const result = await service.getProblem('1');

      // Then
      expect(result.uuid).toBe('1');
      expect(result.contentList).toHaveLength(1);
    });

    it('문제가 없으면 ProblemNotFoundException을 던진다', async () => {
      // Given
      repository.getProblem.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getProblem('none')).rejects.toThrow(ProblemNotFoundException);
    });

    it('에러 시 로깅 후 에러를 재전파한다', async () => {
      // Given
      repository.getProblem.mockRejectedValue(new Error('DB error'));

      // When & Then
      await expect(service.getProblem('1')).rejects.toThrow('DB error');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

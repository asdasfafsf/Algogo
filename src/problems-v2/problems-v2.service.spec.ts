import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsV2Service } from './problems-v2.service';
import { ProblemsV2Repository } from './problems-v2.repository';
import { ProblemNotFoundException } from '../common/errors/problem/ProblemNotFoundException';
import { USER_PROBLEM_STATE } from '../common/constants/user.constant';
import { PROBLEM_SORT_MAP } from './constants/problems-sort';

describe('ProblemsV2Service', () => {
  let service: ProblemsV2Service;
  let repository: jest.Mocked<ProblemsV2Repository>;

  beforeEach(async () => {
    const mockRepository = {
      getProblemSumamryByTitle: jest.fn(),
      getProblemsSummary: jest.fn(),
      getProblem: jest.fn(),
      getTodayProblems: jest.fn(),
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
    repository = module.get<ProblemsV2Repository>(
      ProblemsV2Repository,
    ) as jest.Mocked<ProblemsV2Repository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProblemsSummary', () => {
    describe('제목 검색 분기 로직', () => {
      it('제목이 없을 때 일반 검색을 사용해야 함', async () => {
        // Given
        const dto = {
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemsSummary.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemsSummary).toHaveBeenCalledWith(dto);
        expect(repository.getProblemSumamryByTitle).not.toHaveBeenCalled();
      });

      it('제목이 1글자일 때 일반 검색을 사용해야 함', async () => {
        // Given
        const dto = {
          title: 'A',
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemsSummary.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemsSummary).toHaveBeenCalledWith(dto);
        expect(repository.getProblemSumamryByTitle).not.toHaveBeenCalled();
      });

      it('빈 문자열 제목일 때 일반 검색을 사용해야 함', async () => {
        // Given
        const dto = {
          title: '',
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemsSummary.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemsSummary).toHaveBeenCalledWith(dto);
        expect(repository.getProblemSumamryByTitle).not.toHaveBeenCalled();
      });

      it('특수문자가 포함된 제목일 때 일반 검색을 사용해야 함 (+)', async () => {
        // Given
        const dto = {
          title: 'A+B',
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemsSummary.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemsSummary).toHaveBeenCalledWith(dto);
        expect(repository.getProblemSumamryByTitle).not.toHaveBeenCalled();
      });

      it('모든 특수문자가 포함된 제목일 때 일반 검색을 사용해야 함', async () => {
        // Given
        const dto = {
          title: '+-<>@~*',
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemsSummary.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemsSummary).toHaveBeenCalledWith(dto);
        expect(repository.getProblemSumamryByTitle).not.toHaveBeenCalled();
      });

      it('정상적인 제목일 때 N-gram 검색을 사용해야 함', async () => {
        // Given
        const dto = {
          title: '알고리즘',
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemSumamryByTitle.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemSumamryByTitle).toHaveBeenCalledWith(dto);
        expect(repository.getProblemsSummary).not.toHaveBeenCalled();
      });

      it('2글자 이상이고 특수문자가 없을 때 N-gram 검색을 사용해야 함', async () => {
        // Given
        const dto = {
          title: 'Hello World',
          pageNo: 1,
          pageSize: 10,
          sort: PROBLEM_SORT_MAP.DEFAULT,
        } as any;
        repository.getProblemSumamryByTitle.mockResolvedValue({} as any);

        // When
        await service.getProblemsSummary(dto);

        // Then
        expect(repository.getProblemSumamryByTitle).toHaveBeenCalledWith(dto);
        expect(repository.getProblemsSummary).not.toHaveBeenCalled();
      });
    });

    it('레포지토리 결과를 그대로 반환해야 함', async () => {
      // Given
      const dto = {
        title: '알고리즘',
        pageNo: 1,
        pageSize: 10,
        sort: PROBLEM_SORT_MAP.DEFAULT,
      } as any;
      const expectedResult = {
        problemList: [{ uuid: 'test-uuid', title: '알고리즘 문제' }],
        totalCount: 1,
        pageNo: 1,
        pageSize: 10,
      };
      repository.getProblemSumamryByTitle.mockResolvedValue(
        expectedResult as any,
      );

      // When
      const result = await service.getProblemsSummary(dto);

      // Then
      expect(result).toBe(expectedResult);
    });
  });

  describe('getProblem', () => {
    it('문제가 존재하지 않을 때 ProblemNotFoundException을 발생시켜야 함', async () => {
      // Given
      const dto = { uuid: 'non-existent-uuid', userUuid: 'user-uuid' };
      repository.getProblem.mockResolvedValue(null);

      // When & Then
      await expect(service.getProblem(dto)).rejects.toThrow(
        ProblemNotFoundException,
      );
      expect(repository.getProblem).toHaveBeenCalledWith(dto);
    });

    it('문제가 존재할 때 정상적으로 변환된 데이터를 반환해야 함', async () => {
      // Given
      const dto = { uuid: 'test-uuid', userUuid: 'user-uuid' };
      const mockProblem = {
        uuid: 'test-uuid',
        title: '테스트 문제',
        userProblemStateList: [{ state: 'SOLVED' }],
        typeList: [{ name: '수학' }, { name: '구현' }],
        languageLimitList: [{ language: 'C++' }, { language: 'Java' }],
      };
      repository.getProblem.mockResolvedValue(mockProblem as any);

      // When
      const result = await service.getProblem(dto);

      // Then
      expect(result).toEqual({
        ...mockProblem,
        state: 'SOLVED',
        typeList: ['수학', '구현'],
        languageLimitList: ['C++', 'Java'],
      });
    });

    it('사용자 문제 상태가 없을 때 NONE으로 설정되어야 함', async () => {
      // Given
      const dto = { uuid: 'test-uuid', userUuid: 'user-uuid' };
      const mockProblem = {
        uuid: 'test-uuid',
        title: '테스트 문제',
        userProblemStateList: [],
        typeList: [],
        languageLimitList: [],
      };
      repository.getProblem.mockResolvedValue(mockProblem as any);

      // When
      const result = await service.getProblem(dto);

      // Then
      expect(result.state).toBe(USER_PROBLEM_STATE.NONE);
    });

    it('userProblemStateList가 undefined일 때 NONE으로 설정되어야 함', async () => {
      // Given
      const dto = { uuid: 'test-uuid' };
      const mockProblem = {
        uuid: 'test-uuid',
        title: '테스트 문제',
        userProblemStateList: undefined,
        typeList: [],
        languageLimitList: [],
      };
      repository.getProblem.mockResolvedValue(mockProblem as any);

      // When
      const result = await service.getProblem(dto);

      // Then
      expect(result.state).toBe(USER_PROBLEM_STATE.NONE);
    });

    it('빈 typeList와 languageLimitList를 올바르게 처리해야 함', async () => {
      // Given
      const dto = { uuid: 'test-uuid' };
      const mockProblem = {
        uuid: 'test-uuid',
        title: '테스트 문제',
        userProblemStateList: [],
        typeList: [],
        languageLimitList: [],
      };
      repository.getProblem.mockResolvedValue(mockProblem as any);

      // When
      const result = await service.getProblem(dto);

      // Then
      expect(result.typeList).toEqual([]);
      expect(result.languageLimitList).toEqual([]);
    });
  });

  describe('getTodayProblems', () => {
    beforeEach(() => {
      // Date 모킹을 위한 고정 시간 설정
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:30:00Z')); // 고정된 시간으로 설정
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('addDays가 0일 때 오늘 날짜 범위로 조회해야 함', async () => {
      // Given
      const params = { userUuid: 'user-uuid', addDays: 0 };
      const mockProblems = [
        { uuid: 'problem-1', level: 4, userProblemStateList: [] },
      ];
      repository.getTodayProblems.mockResolvedValue(mockProblems as any);

      // When
      await service.getTodayProblems(params);

      // Then
      const expectedCall = repository.getTodayProblems.mock.calls[0][0];
      expect(expectedCall.startDate.getHours()).toBe(0);
      expect(expectedCall.startDate.getMinutes()).toBe(0);
      expect(expectedCall.startDate.getSeconds()).toBe(0);
      expect(expectedCall.endDate.getHours()).toBe(0);
      expect(expectedCall.endDate.getMinutes()).toBe(0);
      expect(expectedCall.endDate.getSeconds()).toBe(0);
      expect(expectedCall.userUuid).toBe('user-uuid');
    });

    it('addDays가 -1일 때 어제 날짜 범위로 조회해야 함', async () => {
      // Given
      const params = { userUuid: 'user-uuid', addDays: -1 };
      repository.getTodayProblems.mockResolvedValue([]);

      // When
      await service.getTodayProblems(params);

      // Then
      expect(repository.getTodayProblems).toHaveBeenCalled();
      const call = repository.getTodayProblems.mock.calls[0][0];
      expect(call.startDate.getDate()).toBe(14); // 어제
      expect(call.endDate.getDate()).toBe(15); // 오늘
    });

    describe('난이도 매핑', () => {
      it('level 0-3일 때 입문으로 매핑되어야 함', async () => {
        // Given
        const params = { addDays: 0 };
        const mockProblems = [
          { uuid: 'problem-1', level: 0 },
          { uuid: 'problem-2', level: 1 },
          { uuid: 'problem-3', level: 2 },
          { uuid: 'problem-4', level: 3 },
        ];
        repository.getTodayProblems.mockResolvedValue(mockProblems as any);

        // When
        const result = await service.getTodayProblems(params);

        // Then
        result.forEach((problem) => {
          expect(problem.difficulty).toBe('입문');
        });
      });

      it('level 4-7일 때 초급으로 매핑되어야 함', async () => {
        // Given
        const params = { addDays: 0 };
        const mockProblems = [
          { uuid: 'problem-1', level: 4 },
          { uuid: 'problem-2', level: 7 },
        ];
        repository.getTodayProblems.mockResolvedValue(mockProblems as any);

        // When
        const result = await service.getTodayProblems(params);

        // Then
        result.forEach((problem) => {
          expect(problem.difficulty).toBe('초급');
        });
      });

      it('level 16-19일 때 심화로 매핑되어야 함', async () => {
        // Given
        const params = { addDays: 0 };
        const mockProblems = [
          { uuid: 'problem-1', level: 16 },
          { uuid: 'problem-2', level: 19 },
        ];
        repository.getTodayProblems.mockResolvedValue(mockProblems as any);

        // When
        const result = await service.getTodayProblems(params);

        // Then
        result.forEach((problem) => {
          expect(problem.difficulty).toBe('심화');
        });
      });

      it('level 20 이상일 때 알 수 없음으로 매핑되어야 함', async () => {
        // Given
        const params = { addDays: 0 };
        const mockProblems = [
          { uuid: 'problem-1', level: 20 },
          { uuid: 'problem-2', level: 25 },
        ];
        repository.getTodayProblems.mockResolvedValue(mockProblems as any);

        // When
        const result = await service.getTodayProblems(params);

        // Then
        result.forEach((problem) => {
          expect(problem.difficulty).toBe('알 수 없음');
        });
      });
    });

    it('userProblemStateList를 undefined로 설정해야 함', async () => {
      // Given
      const params = { addDays: 0 };
      const mockProblems = [
        {
          uuid: 'problem-1',
          level: 4,
          userProblemStateList: [{ state: 'SOLVED' }],
        },
      ];
      repository.getTodayProblems.mockResolvedValue(mockProblems as any);

      // When
      const result = await service.getTodayProblems(params);

      // Then
      expect(result[0]).toBeDefined();
    });

    it('레포지토리에서 받은 모든 데이터를 유지하면서 변환해야 함', async () => {
      // Given
      const params = { addDays: 0 };
      const mockProblems = [
        {
          uuid: 'problem-1',
          title: '오늘의 문제',
          level: 8,
          content: '문제 내용',
          userProblemStateList: [{ state: 'IN_PROGRESS' }],
        },
      ];
      repository.getTodayProblems.mockResolvedValue(mockProblems as any);

      // When
      const result = await service.getTodayProblems(params);

      // Then
      expect(result[0]).toEqual({
        uuid: 'problem-1',
        title: '오늘의 문제',
        level: 8,
        content: '문제 내용',
        userProblemStateList: undefined,
        difficulty: '중급',
      });
    });
  });
});

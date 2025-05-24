import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsV2Controller } from './problems-v2.controller';
import { InquiryProblemsSummaryDto } from './dto/inquiry-problems-summary.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PROBLEM_SORT_MAP } from './constants/problems-sort';
import { PROBLEM_TYPE_MAP } from './constants/problems-type';
import { ProblemsV2Service } from './problems-v2.service';

describe('ProblemsV2Controller', () => {
  let controller: ProblemsV2Controller;
  let problemsV2Service: ProblemsV2Service;

  beforeEach(async () => {
    const mockProblemsV2Service = {
      getProblemsSummary: jest.fn(),
      getProblem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemsV2Controller],
      providers: [
        {
          provide: ProblemsV2Service,
          useValue: mockProblemsV2Service,
        },
      ],
    }).compile();

    controller = module.get<ProblemsV2Controller>(ProblemsV2Controller);
    problemsV2Service = module.get<ProblemsV2Service>(ProblemsV2Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('InquiryProblemsSummaryDto 유효성 검증', () => {
    it('기본값이 올바르게 설정되어야 함', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, {});

      expect(dto.pageNo).toBe(1);
      expect(dto.pageSize).toBe(10);
      expect(dto.sort).toBe(PROBLEM_SORT_MAP.DEFAULT);
    });

    it('pageNo가 0보다 작으면 유효성 검증 실패', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, { pageNo: -1 });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('pageSize가 허용된 값이 아니면 유효성 검증 실패', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, { pageSize: 30 });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('typeList에 올바르지 않은 유형이 있으면 유효성 검증 실패', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, {
        typeList: ['존재하지_않는_유형'],
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('typeList에 올바른 유형만 있으면 유효성 검증 성공', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, {
        typeList: [PROBLEM_TYPE_MAP.수학, PROBLEM_TYPE_MAP.구현],
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('sort가 올바르지 않은 값이면 유효성 검증 실패', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, {
        sort: 999, // 존재하지 않는 정렬 값
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('sort가 올바른 값이면 유효성 검증 성공', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, {
        sort: PROBLEM_SORT_MAP.TITLE_ASC,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('모든 필드가 유효하면 검증 성공', async () => {
      const dto = plainToInstance(InquiryProblemsSummaryDto, {
        pageNo: 2,
        pageSize: 20,
        title: '알고리즘',
        levelList: [1, 2, 3],
        typeList: [PROBLEM_TYPE_MAP.수학],
        sort: PROBLEM_SORT_MAP.LEVEL_DESC,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('Transform 데코레이터가 값을 올바르게 변환해야 함', async () => {
      // 문자열로 입력된 값들이 올바른 타입으로 변환되는지 테스트
      const dto = plainToInstance(InquiryProblemsSummaryDto, {
        pageNo: '2',
        pageSize: '20',
        levelList: ['1', '2', '3'],
      });

      expect(typeof dto.pageNo).toBe('number');
      expect(dto.pageNo).toBe(2);

      expect(typeof dto.pageSize).toBe('number');
      expect(dto.pageSize).toBe(20);

      expect(Array.isArray(dto.levelList)).toBe(true);
      expect(dto.levelList).toEqual([1, 2, 3]);
    });
  });

  describe('getProblems', () => {
    it('서비스의 getProblemsSummary 메소드를 올바른 파라미터로 호출해야 함', async () => {
      const dto = { pageNo: 2, pageSize: 20 };
      await controller.getProblems(dto as InquiryProblemsSummaryDto);
      expect(problemsV2Service.getProblemsSummary).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProblem', () => {
    it('서비스의 getProblem 메소드를 올바른 UUID로 호출해야 함', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      await controller.getProblem(uuid);
      expect(problemsV2Service.getProblem).toHaveBeenCalledWith(uuid);
    });
  });
});

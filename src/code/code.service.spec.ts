import { Test, TestingModule } from '@nestjs/testing';
import { CodeService } from './code.service';
import { CodeRepository } from './code.repository';
import { RedisService } from '../redis/redis.service';
import { AppLogger } from '../logger/app-logger';
import { NotFoundCodeSettingException } from './errors/NotFoundCodeSettingException';
import { NotFoundCodeTemplateException } from './errors/NotFoundCodeTemplateException';
import { CodeTemplateLimitExceededException } from './errors/CodeTemplateLimitExceededException';
import { NotFoundProblemException } from './errors/NotFoundProblemException';
import { NotFoundProblemCode } from './errors/NotFoundProblemCode';
import { MAX_CODE_TEMPLATE_COUNT } from './constants';

describe('CodeService 단위 테스트', () => {
  let service: CodeService;
  let repository: jest.Mocked<CodeRepository>;
  let redisService: jest.Mocked<RedisService>;

  const mockCodeRepository = {
    getCodeSetting: jest.fn(),
    upsertCodeSetting: jest.fn(),
    getCodeTemplateResult: jest.fn(),
    getCodeTemplate: jest.fn(),
    createCodeTemplate: jest.fn(),
    selectTotalCodeTemplateCount: jest.fn(),
    getCodeTemplateNo: jest.fn(),
    updateCodeTempltae: jest.fn(),
    deleteCodeTemplate: jest.fn(),
    upsertCodeDefaultTemplate: jest.fn(),
    problemUuidToProblemNo: jest.fn(),
    getProblemCodes: jest.fn(),
    upsertProblemCode: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockLogger: Partial<AppLogger> = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeService,
        { provide: CodeRepository, useValue: mockCodeRepository },
        { provide: RedisService, useValue: mockRedisService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CodeService>(CodeService);
    repository = module.get(CodeRepository) as jest.Mocked<CodeRepository>;
    redisService = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCodeSetting', () => {
    const userUuid = 'user-uuid-1';

    it('코드 설정이 존재하면 반환한다', async () => {
      // Given
      const mockSetting = { fontSize: 14, tabSize: 2 };
      repository.getCodeSetting.mockResolvedValue(mockSetting as never);

      // When
      const result = await service.getCodeSetting(userUuid);

      // Then
      expect(result).toEqual(mockSetting);
      expect(repository.getCodeSetting).toHaveBeenCalledWith(userUuid);
    });

    it('코드 설정이 없으면 NotFoundCodeSettingException을 던진다', async () => {
      // Given
      repository.getCodeSetting.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getCodeSetting(userUuid)).rejects.toThrow(
        NotFoundCodeSettingException,
      );
    });
  });

  describe('upsertCodeSetting', () => {
    it('repository에 위임한다', async () => {
      // Given
      const dto = { userUuid: 'user-uuid-1', fontSize: 16, tabSize: 4 };
      const mockResult = { ...dto };
      repository.upsertCodeSetting.mockResolvedValue(mockResult as never);

      // When
      const result = await service.upsertCodeSetting(dto as never);

      // Then
      expect(result).toEqual(mockResult);
      expect(repository.upsertCodeSetting).toHaveBeenCalledWith(dto);
    });
  });

  describe('getCodeTemplateResult', () => {
    const userUuid = 'user-uuid-1';

    it('summaryList와 defaultList의 language를 매핑하여 반환한다', async () => {
      // Given
      const mockData = {
        summaryList: [
          { uuid: 'uuid-1', name: '템플릿1', language: 'JAVA' },
          { uuid: 'uuid-2', name: '템플릿2', language: 'PYTHON' },
        ],
        defaultList: [
          { language: 'JAVA', codeTemplateUuid: 'uuid-1' },
        ],
      };
      repository.getCodeTemplateResult.mockResolvedValue(mockData as never);

      // When
      const result = await service.getCodeTemplateResult(userUuid);

      // Then
      expect(result.summaryList).toHaveLength(2);
      expect(result.summaryList[0].language).toBe('JAVA');
      expect(result.summaryList[1].language).toBe('PYTHON');
      expect(result.defaultList).toHaveLength(1);
      expect(result.defaultList[0].language).toBe('JAVA');
      expect(repository.getCodeTemplateResult).toHaveBeenCalledWith(userUuid);
    });
  });

  describe('getCodeTemplate', () => {
    const userUuid = 'user-uuid-1';
    const uuid = 'template-uuid-1';

    it('코드 템플릿이 존재하면 반환한다', async () => {
      // Given
      const mockTemplate = {
        uuid,
        name: '테스트 템플릿',
        language: 'JAVA',
        content: 'public class Main {}',
        description: '설명',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.getCodeTemplate.mockResolvedValue(mockTemplate as never);

      // When
      const result = await service.getCodeTemplate({ userUuid, uuid });

      // Then
      expect(result).toEqual(mockTemplate);
      expect(repository.getCodeTemplate).toHaveBeenCalledWith({
        userUuid,
        uuid,
      });
    });

    it('코드 템플릿이 없으면 NotFoundCodeTemplateException을 던진다', async () => {
      // Given
      repository.getCodeTemplate.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getCodeTemplate({ userUuid, uuid })).rejects.toThrow(
        NotFoundCodeTemplateException,
      );
    });
  });

  describe('createCodeTemplate', () => {
    const userUuid = 'user-uuid-1';

    it('템플릿을 생성하고 반환한다', async () => {
      // Given
      const dto = {
        userUuid,
        content: 'code',
        description: '설명',
        name: '새 템플릿',
        language: 'JAVA' as const,
        isDefault: false,
      };
      const mockCreated = { uuid: 'new-uuid', ...dto };
      repository.selectTotalCodeTemplateCount.mockResolvedValue(0);
      repository.createCodeTemplate.mockResolvedValue(mockCreated as never);

      // When
      const result = await service.createCodeTemplate(dto as never);

      // Then
      expect(result).toEqual(mockCreated);
      expect(repository.createCodeTemplate).toHaveBeenCalledWith({
        userUuid,
        content: 'code',
        description: '설명',
        name: '새 템플릿',
        language: 'JAVA',
      });
    });

    it('isDefault가 true이면 setDefaultCodeTemplate을 호출한다', async () => {
      // Given
      const dto = {
        userUuid,
        content: 'code',
        description: '설명',
        name: '기본 템플릿',
        language: 'JAVA' as const,
        isDefault: true,
      };
      const mockCreated = { uuid: 'new-uuid', ...dto };
      repository.selectTotalCodeTemplateCount.mockResolvedValue(0);
      repository.createCodeTemplate.mockResolvedValue(mockCreated as never);
      repository.getCodeTemplateNo.mockResolvedValue(1);
      repository.upsertCodeDefaultTemplate.mockResolvedValue(undefined as never);

      // When
      await service.createCodeTemplate(dto as never);

      // Then
      expect(repository.getCodeTemplateNo).toHaveBeenCalledWith({
        uuid: 'new-uuid',
        userUuid,
      });
      expect(repository.upsertCodeDefaultTemplate).toHaveBeenCalled();
    });

    it('템플릿 개수가 MAX_CODE_TEMPLATE_COUNT 이상이면 CodeTemplateLimitExceededException을 던진다', async () => {
      // Given
      const dto = {
        userUuid,
        content: 'code',
        name: '초과 템플릿',
        language: 'JAVA' as const,
        isDefault: false,
      };
      repository.selectTotalCodeTemplateCount.mockResolvedValue(
        MAX_CODE_TEMPLATE_COUNT,
      );

      // When & Then
      await expect(service.createCodeTemplate(dto as never)).rejects.toThrow(
        CodeTemplateLimitExceededException,
      );
    });
  });

  describe('updateCodeTemplate', () => {
    const userUuid = 'user-uuid-1';
    const uuid = 'template-uuid-1';

    it('템플릿을 수정하고 반환한다', async () => {
      // Given
      const dto = {
        userUuid,
        uuid,
        content: 'updated code',
        description: '수정 설명',
        name: '수정 템플릿',
        language: 'PYTHON' as const,
        isDefault: false,
      };
      repository.getCodeTemplateNo.mockResolvedValue(1);
      const mockUpdated = { ...dto };
      repository.updateCodeTempltae.mockResolvedValue(mockUpdated as never);

      // When
      const result = await service.updateCodeTemplate(dto as never);

      // Then
      expect(result).toEqual(mockUpdated);
      expect(repository.updateCodeTempltae).toHaveBeenCalledWith({
        userUuid,
        content: 'updated code',
        description: '수정 설명',
        name: '수정 템플릿',
        language: 'PYTHON',
        no: 1,
      });
    });

    it('존재하지 않는 템플릿이면 NotFoundCodeTemplateException을 던진다', async () => {
      // Given
      const dto = {
        userUuid,
        uuid,
        content: 'code',
        name: '없는 템플릿',
        language: 'JAVA' as const,
        isDefault: false,
      };
      repository.getCodeTemplateNo.mockResolvedValue(null as never);

      // When & Then
      await expect(service.updateCodeTemplate(dto as never)).rejects.toThrow(
        NotFoundCodeTemplateException,
      );
    });

    it('isDefault가 true이면 setDefaultCodeTemplate을 호출한다', async () => {
      // Given
      const dto = {
        userUuid,
        uuid,
        content: 'code',
        description: '설명',
        name: '기본 설정',
        language: 'JAVA' as const,
        isDefault: true,
      };
      repository.getCodeTemplateNo.mockResolvedValueOnce(1);
      const mockUpdated = { ...dto };
      repository.updateCodeTempltae.mockResolvedValue(mockUpdated as never);
      repository.getCodeTemplateNo.mockResolvedValueOnce(1);
      repository.upsertCodeDefaultTemplate.mockResolvedValue(undefined as never);

      // When
      await service.updateCodeTemplate(dto as never);

      // Then
      expect(repository.upsertCodeDefaultTemplate).toHaveBeenCalled();
    });
  });

  describe('deleteCodeTemplate', () => {
    const userUuid = 'user-uuid-1';
    const uuid = 'template-uuid-1';

    it('템플릿을 삭제한다', async () => {
      // Given
      repository.getCodeTemplateNo.mockResolvedValue(1);
      repository.deleteCodeTemplate.mockResolvedValue(undefined as never);

      // When
      await service.deleteCodeTemplate({ uuid, userUuid });

      // Then
      expect(repository.getCodeTemplateNo).toHaveBeenCalledWith({ uuid, userUuid });
      expect(repository.deleteCodeTemplate).toHaveBeenCalledWith({ no: 1 });
    });

    it('존재하지 않는 템플릿이면 NotFoundCodeTemplateException을 던진다', async () => {
      // Given
      repository.getCodeTemplateNo.mockResolvedValue(null as never);

      // When & Then
      await expect(
        service.deleteCodeTemplate({ uuid, userUuid }),
      ).rejects.toThrow(NotFoundCodeTemplateException);
    });
  });

  describe('setDefaultCodeTemplate', () => {
    const userUuid = 'user-uuid-1';

    it('기본 템플릿을 설정한다', async () => {
      // Given
      const dto = { userUuid, uuid: 'template-uuid-1', language: 'JAVA' as const };
      repository.getCodeTemplateNo.mockResolvedValue(1);
      repository.upsertCodeDefaultTemplate.mockResolvedValue(undefined as never);

      // When
      await service.setDefaultCodeTemplate(dto as never);

      // Then
      expect(repository.getCodeTemplateNo).toHaveBeenCalledWith({
        uuid: 'template-uuid-1',
        userUuid,
      });
      expect(repository.upsertCodeDefaultTemplate).toHaveBeenCalledWith({
        userUuid,
        language: 'JAVA',
        codeTemplateNo: 1,
      });
    });

    it('uuid가 없으면 NotFoundCodeTemplateException을 던진다', async () => {
      // Given
      const dto = { userUuid, uuid: '', language: 'JAVA' as const };

      // When & Then
      await expect(
        service.setDefaultCodeTemplate(dto as never),
      ).rejects.toThrow(NotFoundCodeTemplateException);
    });

    it('템플릿이 존재하지 않으면 NotFoundCodeTemplateException을 던진다', async () => {
      // Given
      const dto = { userUuid, uuid: 'non-existent', language: 'JAVA' as const };
      repository.getCodeTemplateNo.mockResolvedValue(null as never);

      // When & Then
      await expect(
        service.setDefaultCodeTemplate(dto as never),
      ).rejects.toThrow(NotFoundCodeTemplateException);
    });
  });

  describe('problemUuidToProblemNo', () => {
    const problemUuid = 'problem-uuid-1';

    it('Redis에 캐시가 있으면 캐시된 값을 반환한다', async () => {
      // Given
      redisService.get.mockResolvedValue('42');

      // When
      const result = await service.problemUuidToProblemNo(problemUuid);

      // Then
      expect(result).toBe(42);
      expect(redisService.get).toHaveBeenCalledWith(`problemUuid_${problemUuid}`);
      expect(repository.problemUuidToProblemNo).not.toHaveBeenCalled();
    });

    it('Redis 미스 시 DB 조회 후 캐시에 저장하고 반환한다', async () => {
      // Given
      redisService.get.mockResolvedValue(null);
      repository.problemUuidToProblemNo.mockResolvedValue({ no: 99 } as never);

      // When
      const result = await service.problemUuidToProblemNo(problemUuid);

      // Then
      expect(result).toBe(99);
      expect(repository.problemUuidToProblemNo).toHaveBeenCalledWith(problemUuid);
      expect(redisService.set).toHaveBeenCalledWith(
        `problemUuid_${problemUuid}`,
        '99',
      );
    });

    it('Redis 미스이고 DB에도 없으면 NotFoundProblemException을 던진다', async () => {
      // Given
      redisService.get.mockResolvedValue(null);
      repository.problemUuidToProblemNo.mockResolvedValue(null as never);

      // When & Then
      await expect(
        service.problemUuidToProblemNo(problemUuid),
      ).rejects.toThrow(NotFoundProblemException);
    });
  });

  describe('getProblemCodes', () => {
    const userUuid = 'user-uuid-1';
    const problemUuid = 'problem-uuid-1';

    it('문제 코드가 존재하면 반환한다', async () => {
      // Given
      const mockCodes = { language: 'JAVA', content: 'code' };
      repository.getProblemCodes.mockResolvedValue(mockCodes as never);

      // When
      const result = await service.getProblemCodes({ userUuid, problemUuid });

      // Then
      expect(result).toEqual(mockCodes);
      expect(repository.getProblemCodes).toHaveBeenCalledWith({
        userUuid,
        problemUuid,
      });
    });

    it('문제 코드가 없으면 NotFoundProblemCode를 던진다', async () => {
      // Given
      repository.getProblemCodes.mockResolvedValue(null as never);

      // When & Then
      await expect(
        service.getProblemCodes({ userUuid, problemUuid }),
      ).rejects.toThrow(NotFoundProblemCode);
    });
  });

  describe('upsertProblemCode', () => {
    it('repository에 위임한다', async () => {
      // Given
      const dto = {
        userUuid: 'user-uuid-1',
        problemUuid: 'problem-uuid-1',
        language: 'JAVA' as const,
        content: 'code',
      };
      const mockResult = { ...dto };
      repository.upsertProblemCode.mockResolvedValue(mockResult as never);

      // When
      const result = await service.upsertProblemCode(dto as never);

      // Then
      expect(result).toEqual(mockResult);
      expect(repository.upsertProblemCode).toHaveBeenCalledWith({
        userUuid: 'user-uuid-1',
        problemUuid: 'problem-uuid-1',
        language: 'JAVA',
        content: 'code',
      });
    });
  });
});

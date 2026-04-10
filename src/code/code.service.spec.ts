import { Test, TestingModule } from '@nestjs/testing';
import { CodeService } from './code.service';
import { CodeRepository } from './code.repository';
import { RedisService } from '../redis/redis.service';
import { AppLogger } from '../logger/app-logger';
import { NotFoundCodeTemplateException } from './errors/NotFoundCodeTemplateException';

describe('CodeService 단위 테스트', () => {
  let service: CodeService;

  const mockCodeRepository: Partial<CodeRepository> = {
    getCodeTemplate: jest.fn(),
  };

  const mockRedisService: Partial<RedisService> = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockLogger: Partial<AppLogger> = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeService,
        { provide: CodeRepository, useValue: mockCodeRepository },
        { provide: RedisService, useValue: mockRedisService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CodeService>(CodeService);
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
      (mockCodeRepository.getCodeTemplate as jest.Mock).mockResolvedValue(
        mockTemplate,
      );

      // When
      const result = await service.getCodeTemplate({ userUuid, uuid });

      // Then
      expect(result).toEqual(mockTemplate);
      expect(mockCodeRepository.getCodeTemplate).toHaveBeenCalledWith({
        userUuid,
        uuid,
      });
    });

    it('코드 템플릿이 없으면 NotFoundCodeTemplateException을 던진다', async () => {
      // Given
      (mockCodeRepository.getCodeTemplate as jest.Mock).mockResolvedValue(null);

      // When & Then
      await expect(service.getCodeTemplate({ userUuid, uuid })).rejects.toThrow(
        NotFoundCodeTemplateException,
      );
    });
  });
});

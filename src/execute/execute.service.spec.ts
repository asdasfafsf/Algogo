import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteService } from './execute.service';
import bullmqConfig from '../config/bullmqConfig';
import { CustomLogger } from '../logger/custom-logger';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ExecuteService', () => {
  let service: ExecuteService;

  const mockConfig = {
    host: 'localhost',
    port: 6379,
    password: '',
    queueName: 'test-queue',
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    silly: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteService,
        { provide: bullmqConfig.KEY, useValue: mockConfig },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get(ExecuteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJobId', () => {
    it('provider를 포함한 고유 ID를 생성한다', async () => {
      // When
      const jobId = await service.generateJobId('JAVA');

      // Then
      expect(jobId).toMatch(/^JAVA_\d+_/);
    });

    it('호출할 때마다 다른 ID를 생성한다', async () => {
      // When
      const id1 = await service.generateJobId('PYTHON');
      const id2 = await service.generateJobId('PYTHON');

      // Then
      expect(id1).not.toBe(id2);
    });
  });

  describe('run', () => {
    it('queue가 초기화되지 않으면 에러를 반환한다', async () => {
      // Given - onModuleInit을 호출하지 않아 queue가 없음
      const dto = {
        jobId: 'test-job',
        language: 'JAVA',
        code: 'System.out.println("hello")',
        inputList: ['1'],
      };

      // When
      const result = await service.run(dto as never);

      // Then
      expect(result).toHaveProperty('code', '9999');
      expect(result).toHaveProperty('result');
    });
  });
});

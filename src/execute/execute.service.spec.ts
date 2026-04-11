import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteService } from './execute.service';
import bullmqConfig from '../config/bullmqConfig';
import { AppLogger } from '../logger/app-logger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestRunDto } from './dto/RequestRunDto';

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
        { provide: AppLogger, useValue: mockLogger },
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
    const dto: RequestRunDto = {
      id: 'test-job',
      provider: 'Java',
      code: 'System.out.println("hello")',
      inputList: [{ input: '1', seq: '1' }],
    } as RequestRunDto;

    it('queue가 초기화되지 않으면 에러를 반환한다', async () => {
      // Given - onModuleInit을 호출하지 않아 queue가 없음

      // When
      const result = await service.run(dto);

      // Then
      expect(result).toHaveProperty('code', '9999');
      expect(result).toHaveProperty('result');
    });

    it('정상적으로 실행되면 결과를 반환한다', async () => {
      // Given
      const expectedResult = {
        processTime: 100,
        memory: 256,
        code: '0000',
        result: '성공',
      };
      const mockJob = {
        waitUntilFinished: jest.fn().mockResolvedValue(expectedResult),
      };
      const mockQueue = {
        add: jest.fn().mockResolvedValue(mockJob),
      };
      (service as unknown as { queue: unknown }).queue = mockQueue;
      (service as unknown as { queueEvents: unknown }).queueEvents = {};

      // When
      const result = await service.run(dto);

      // Then
      expect(result).toEqual(expectedResult);
      expect(mockQueue.add).toHaveBeenCalledWith('run', dto, {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
      });
    });

    it('타임아웃이 발생하면 code 9000을 반환한다', async () => {
      // Given
      const mockJob = {
        waitUntilFinished: jest
          .fn()
          .mockRejectedValue(new Error('timed out before finishing, id=test')),
      };
      const mockQueue = {
        add: jest.fn().mockResolvedValue(mockJob),
      };
      (service as unknown as { queue: unknown }).queue = mockQueue;
      (service as unknown as { queueEvents: unknown }).queueEvents = {};

      // When
      const result = await service.run(dto);

      // Then
      expect(result).toEqual({
        processTime: 0,
        memory: 0,
        code: '9000',
        result: '시간 초과',
      });
    });

    it('기타 에러가 발생하면 code 9999를 반환한다', async () => {
      // Given
      const mockJob = {
        waitUntilFinished: jest
          .fn()
          .mockRejectedValue(new Error('unexpected error')),
      };
      const mockQueue = {
        add: jest.fn().mockResolvedValue(mockJob),
      };
      (service as unknown as { queue: unknown }).queue = mockQueue;
      (service as unknown as { queueEvents: unknown }).queueEvents = {};

      // When
      const result = await service.run(dto);

      // Then
      expect(result).toEqual({
        processTime: 0,
        memory: 0,
        code: '9999',
        result: '예외 오류',
      });
    });
  });
});

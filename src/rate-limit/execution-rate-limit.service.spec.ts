import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionRateLimitService } from './execution-rate-limit.service';
import { RedisService } from '../redis/redis.service';

describe('ExecutionRateLimitService', () => {
  let service: ExecutionRateLimitService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionRateLimitService,
        { provide: RedisService, useValue: { eval: jest.fn() } },
      ],
    }).compile();

    service = module.get(ExecutionRateLimitService);
    redisService = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tryConsumeRequestToken', () => {
    it('토큰이 있으면 true를 반환한다', async () => {
      // Given
      redisService.eval.mockResolvedValue([1, 19, 20] as never);

      // When
      const result = await service.tryConsumeRequestToken('user-1');

      // Then
      expect(result).toBe(true);
      expect(redisService.eval).toHaveBeenCalledWith(
        expect.any(String), 2,
        'compiler_request:user-1', 'compiler_usage:user-1',
        expect.any(Number), 20, expect.any(Number), 20, expect.any(Number),
      );
    });

    it('토큰이 없으면 false를 반환한다', async () => {
      // Given
      redisService.eval.mockResolvedValue([0, 0, 0] as never);

      // When
      const result = await service.tryConsumeRequestToken('user-1');

      // Then
      expect(result).toBe(false);
    });
  });

  describe('commitExecutionDuration', () => {
    it('사용 시간을 Redis에 기록한다', async () => {
      // Given
      redisService.eval.mockResolvedValue(15 as never);

      // When
      await service.commitExecutionDuration('user-1', 5);

      // Then
      expect(redisService.eval).toHaveBeenCalledWith(
        expect.any(String), 1,
        'compiler_usage:user-1',
        expect.any(Number), 5, 20, expect.any(Number),
      );
    });
  });
});

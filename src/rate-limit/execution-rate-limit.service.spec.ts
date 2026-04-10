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
    it('허용되면 true를 반환한다', async () => {
      // Given
      redisService.eval.mockResolvedValue([1, 19, 20] as never);

      // When
      const result = await service.tryConsumeRequestToken('user-1');

      // Then
      expect(result).toBe(true);
    });

    it('거부되면 false를 반환한다', async () => {
      // Given
      redisService.eval.mockResolvedValue([0, 0, 5] as never);

      // When
      const result = await service.tryConsumeRequestToken('user-1');

      // Then
      expect(result).toBe(false);
    });

    it('올바른 Redis 키와 파라미터로 Lua 스크립트를 호출한다', async () => {
      // Given
      redisService.eval.mockResolvedValue([1, 19, 20] as never);

      // When
      await service.tryConsumeRequestToken('user-abc');

      // Then
      expect(redisService.eval).toHaveBeenCalledWith(
        expect.stringContaining('local requestKey = KEYS[1]'),
        2,
        'compiler_request:user-abc',
        'compiler_usage:user-abc',
        expect.any(Number), // now
        20,                 // requestBucketCapacity
        expect.closeTo(20 / 60, 5), // requestRefillRate
        20,                 // usageBucketCapacity
        expect.closeTo(20 / 60, 5), // usageRefillRate
      );
    });
  });

  describe('commitExecutionDuration', () => {
    it('사용 시간을 차감하는 Lua 스크립트를 호출한다', async () => {
      // Given
      redisService.eval.mockResolvedValue(15 as never);

      // When
      await service.commitExecutionDuration('user-1', 5);

      // Then
      expect(redisService.eval).toHaveBeenCalledWith(
        expect.stringContaining('local usageKey = KEYS[1]'),
        1,
        'compiler_usage:user-1',
        expect.any(Number), // now
        5,                  // durationSec
        20,                 // usageBucketCapacity
        expect.closeTo(20 / 60, 5), // usageRefillRate
      );
    });

    it('durationSec가 0이어도 호출된다', async () => {
      // Given
      redisService.eval.mockResolvedValue(20 as never);

      // When
      await service.commitExecutionDuration('user-1', 0);

      // Then
      expect(redisService.eval).toHaveBeenCalledWith(
        expect.any(String), 1,
        'compiler_usage:user-1',
        expect.any(Number), 0, 20, expect.any(Number),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MeService } from './me.service';
import { MeRepository } from './me.repository';
import { S3Service } from '../s3/s3.service';
import { CryptoService } from '../crypto/crypto.service';
import { ImageService } from '../image/image.service';
import { CustomLogger } from '../logger/custom-logger';
import { UserNotFoundException } from '../common/errors/user/UserNotFoundException';

describe('MeService', () => {
  let service: MeService;
  let meRepository: jest.Mocked<MeRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeService,
        { provide: MeRepository, useValue: { getMe: jest.fn(), updateMe: jest.fn() } },
        { provide: S3Service, useValue: { upload: jest.fn(), removeObject: jest.fn() } },
        { provide: CryptoService, useValue: { SHA256: jest.fn().mockReturnValue('hash') } },
        { provide: ImageService, useValue: { toWebp: jest.fn().mockResolvedValue(Buffer.from('webp')) } },
        { provide: CustomLogger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get(MeService);
    meRepository = module.get(MeRepository) as jest.Mocked<MeRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('유저 정보를 반환한다', async () => {
      // Given
      meRepository.getMe.mockResolvedValue({
        uuid: 'test-uuid',
        name: '테스트',
        email: 'test@test.com',
        profilePhoto: '',
        socialList: [{ provider: 'github', content: 'https://github.com/test' }],
        oauthList: [{ provider: 'kakao' }],
      } as never);

      // When
      const result = await service.getMe('test-uuid');

      // Then
      expect(result.uuid).toBe('test-uuid');
      expect(result.socialList).toHaveLength(1);
      expect(result.oauthList).toHaveLength(1);
    });

    it('유저가 없으면 UserNotFoundException을 던진다', async () => {
      // Given
      meRepository.getMe.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getMe('none')).rejects.toThrow(UserNotFoundException);
    });
  });
});

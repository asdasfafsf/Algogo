import { Test, TestingModule } from '@nestjs/testing';
import { MeService } from './me.service';
import { MeRepository } from './me.repository';
import { S3Service } from '../s3/s3.service';
import { CryptoService } from '../crypto/crypto.service';
import { ImageService } from '../image/image.service';
import { AppLogger } from '../logger/app-logger';
import { UserNotFoundException } from '../common/errors/user/UserNotFoundException';

describe('MeService', () => {
  let service: MeService;
  let meRepository: jest.Mocked<MeRepository>;
  let s3Service: jest.Mocked<S3Service>;
  let cryptoService: jest.Mocked<CryptoService>;
  let imageService: jest.Mocked<ImageService>;

  const mockMe = {
    uuid: 'user-uuid',
    name: '테스트',
    email: 'test@test.com',
    profilePhoto: 'https://s3.example.com/old-photo.webp',
    socialList: [
      { provider: 'github', content: 'https://github.com/test' },
      { provider: 'blog', content: 'https://blog.test.com' },
    ],
    oauthList: [{ provider: 'kakao' }, { provider: 'google' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeService,
        {
          provide: MeRepository,
          useValue: { getMe: jest.fn(), updateMe: jest.fn() },
        },
        {
          provide: S3Service,
          useValue: {
            upload: jest.fn().mockResolvedValue('https://s3.example.com/new-photo.webp'),
            removeObject: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: { SHA256: jest.fn().mockReturnValue('hashed-filename') },
        },
        {
          provide: ImageService,
          useValue: { toWebp: jest.fn().mockResolvedValue(Buffer.from('webp-data')) },
        },
        { provide: AppLogger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get(MeService);
    meRepository = module.get(MeRepository) as jest.Mocked<MeRepository>;
    s3Service = module.get(S3Service) as jest.Mocked<S3Service>;
    cryptoService = module.get(CryptoService) as jest.Mocked<CryptoService>;
    imageService = module.get(ImageService) as jest.Mocked<ImageService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('유저 정보를 조회하고 socialList/oauthList를 매핑한다', async () => {
      // Given
      meRepository.getMe.mockResolvedValue(mockMe as never);

      // When
      const result = await service.getMe('user-uuid');

      // Then
      expect(result.uuid).toBe('user-uuid');
      expect(result.socialList).toHaveLength(2);
      expect(result.socialList[0]).toEqual({ provider: 'github', content: 'https://github.com/test' });
      expect(result.oauthList).toHaveLength(2);
      expect(result.oauthList[0]).toEqual({ provider: 'kakao' });
      expect(meRepository.getMe).toHaveBeenCalledWith('user-uuid');
    });

    it('유저가 없으면 UserNotFoundException을 던진다', async () => {
      // Given
      meRepository.getMe.mockResolvedValue(null as never);

      // When & Then
      await expect(service.getMe('none')).rejects.toThrow(UserNotFoundException);
    });

    it('socialList이 빈 배열이면 빈 배열을 반환한다', async () => {
      // Given
      meRepository.getMe.mockResolvedValue({
        ...mockMe,
        socialList: [],
        oauthList: [],
      } as never);

      // When
      const result = await service.getMe('user-uuid');

      // Then
      expect(result.socialList).toEqual([]);
      expect(result.oauthList).toEqual([]);
    });
  });

  describe('updateMe', () => {
    it('파일 없이 프로필을 업데이트한다', async () => {
      // Given
      const updateDto = { userUuid: 'user-uuid', name: '새이름' };
      meRepository.updateMe.mockResolvedValue({
        ...mockMe,
        name: '새이름',
      } as never);

      // When
      const result = await service.updateMe(updateDto as never);

      // Then
      expect(result.name).toBe('새이름');
      expect(imageService.toWebp).not.toHaveBeenCalled();
      expect(s3Service.upload).not.toHaveBeenCalled();
    });

    it('파일이 있으면 WebP 변환 → S3 업로드 → 이전 사진 삭제 플로우를 수행한다', async () => {
      // Given
      const file = { buffer: Buffer.from('image-data') };
      const updateDto = { userUuid: 'user-uuid', name: '새이름', file };
      meRepository.updateMe.mockResolvedValue({
        ...mockMe,
        name: '새이름',
        profilePhoto: 'https://s3.example.com/old-photo.webp',
      } as never);

      // When
      const result = await service.updateMe(updateDto as never);

      // Then
      // 1. 이미지를 WebP로 변환했는지
      expect(imageService.toWebp).toHaveBeenCalledWith(file.buffer);
      // 2. SHA256으로 파일명 생성했는지
      expect(cryptoService.SHA256).toHaveBeenCalled();
      // 3. S3에 업로드했는지
      expect(s3Service.upload).toHaveBeenCalledWith(
        expect.stringContaining('user-uuid/'),
        Buffer.from('webp-data'),
      );
      // 4. 이전 사진을 삭제했는지
      expect(s3Service.removeObject).toHaveBeenCalledWith('https://s3.example.com/old-photo.webp');
      // 6. 결과에 socialList/oauthList가 매핑되었는지
      expect(result.socialList).toBeDefined();
      expect(result.oauthList).toBeDefined();
    });
  });
});

import { S3Service } from './s3.service';
import s3Config from '../config/s3Config';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;

  const mockConfig = {
    region: 'ap-northeast-2',
    endpoint: 'https://s3.example.com',
    bucketName: 'test-bucket',
    accessKey: 'test-key',
    secretKey: 'test-secret',
  };

  beforeEach(() => {
    service = new S3Service(mockConfig as never);
  });

  describe('upload', () => {
    it('파일 URL을 반환한다', async () => {
      // When
      const url = await service.upload('test/file.webp', Buffer.from('data'));

      // Then
      expect(url).toBe('https://s3.example.com/test-bucket/test/file.webp');
    });
  });

  describe('removeObject', () => {
    it('에러 없이 실행된다', async () => {
      // When & Then
      await expect(
        service.removeObject('https://s3.example.com/test-bucket/test/file.webp'),
      ).resolves.toBeUndefined();
    });
  });
});

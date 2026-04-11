import { S3Service } from './s3.service';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const mockSend = jest.fn().mockResolvedValue({});

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
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
    jest.clearAllMocks();
    service = new S3Service(mockConfig as never);
  });

  describe('upload', () => {
    it('PutObjectCommand를 올바른 파라미터로 호출하고 URL을 반환한다', async () => {
      // Given
      const body = Buffer.from('file-data');

      // When
      const url = await service.upload('user/photo.webp', body, 'image/webp');

      // Then
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'user/photo.webp',
        Body: body,
        ACL: 'public-read',
        ContentType: 'image/webp',
      });
      expect(mockSend).toHaveBeenCalled();
      expect(url).toBe('https://s3.example.com/test-bucket/user/photo.webp');
    });

    it('ContentType 없이도 업로드 가능하다', async () => {
      // When
      const url = await service.upload('file.txt', Buffer.from('data'));

      // Then
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({ ContentType: undefined }),
      );
      expect(url).toBe('https://s3.example.com/test-bucket/file.txt');
    });
  });

  describe('removeObject', () => {
    it('endpoint prefix를 제거하고 DeleteObjectCommand를 호출한다', async () => {
      // When
      await service.removeObject('https://s3.example.com/test-bucket/user/photo.webp');

      // Then
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: '/test-bucket/user/photo.webp',
      });
      expect(mockSend).toHaveBeenCalled();
    });

    it('endpoint가 없는 키도 처리한다', async () => {
      // When
      await service.removeObject('user/photo.webp');

      // Then
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'user/photo.webp',
      });
    });
  });
});

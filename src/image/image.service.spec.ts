import { ImageService } from './image.service';

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('webp-data')),
  }));
});

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    service = new ImageService();
  });

  describe('toWebp', () => {
    it('Buffer를 WebP로 변환한다', async () => {
      // Given
      const input = Buffer.from('png-data');

      // When
      const result = await service.toWebp(input);

      // Then
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});

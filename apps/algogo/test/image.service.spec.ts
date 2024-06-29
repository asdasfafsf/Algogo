import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ImageService } from '../src/image/image.service';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ImageService', () => {
  let service: ImageService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ImageService],
    }).compile();

    service = module.get<ImageService>(ImageService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch and convert image to WebP format', async () => {
    const imageUrl =
      'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';

    // Fetch the image using HttpModule
    const response: AxiosResponse<ArrayBuffer> = await lastValueFrom(
      httpService.get(imageUrl, { responseType: 'arraybuffer' }),
    );

    // Convert the response data (image) to Buffer
    const imageBuffer = Buffer.from(response.data);

    // Convert image to WebP format
    const webpBuffer = await service.toWebp(imageBuffer);

    // Check if the converted buffer has WebP format header
    expect(webpBuffer.toString('utf-8', 0, 4)).toBe('RIFF');
    expect(webpBuffer.toString('utf-8', 8, 12)).toBe('WEBP');
  });
});

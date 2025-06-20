import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  async toWebp(target: Buffer) {
    return await sharp(target).webp().toBuffer();
  }
}

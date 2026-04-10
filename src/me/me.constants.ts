import { BadRequestException } from '@nestjs/common';

export const MULTER_OPTION = {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
      return callback(
        new BadRequestException('이미지 파일만 업로드 가능합니다.'),
        false,
      );
    }
    callback(null, true);
  },
};

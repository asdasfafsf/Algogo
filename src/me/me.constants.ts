import { InvalidImageFileException } from './errors/InvalidImageFileException';

export const MULTER_OPTION = {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
      return callback(
        new InvalidImageFileException(),
        false,
      );
    }
    callback(null, true);
  },
};

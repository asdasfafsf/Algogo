import { CustomBadRequestException } from '../../common/errors/CustomBadRequestException';

export class InvalidImageFileException extends CustomBadRequestException {
  constructor() {
    super({
      message: '이미지 파일만 업로드 가능합니다.',
      code: 'INVALID_IMAGE_FILE',
    });
  }
}

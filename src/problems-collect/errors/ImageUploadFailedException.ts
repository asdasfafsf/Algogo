import { CustomBadRequestException } from '../../common/errors/CustomBadRequestException';

export class ImageUploadFailedException extends CustomBadRequestException {
  constructor() {
    super({
      message: '이미지 업로드에 실패했습니다.',
      code: 'IMAGE_UPLOAD_FAILED',
    });
  }
}

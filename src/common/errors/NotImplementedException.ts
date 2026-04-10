import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './CustomHttpException';

export class NotImplementedException extends CustomHttpException {
  constructor() {
    super(
      { code: 'NOT_IMPLEMENTED', message: '아직 구현되지 않은 기능입니다.' },
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}

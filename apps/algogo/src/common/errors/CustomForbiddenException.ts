import { CustomHttpException } from './CustomHttpException';
import { HttpStatus } from '@nestjs/common';

export class CustomForbiddenException extends CustomHttpException {
  constructor(customError: CustomError) {
    super(customError, HttpStatus.FORBIDDEN);
  }
}

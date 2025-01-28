import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './CustomHttpException';

export class CustomConflictException extends CustomHttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.CONFLICT);
  }
}

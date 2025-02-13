import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './CustomHttpException';

export class CustomNotFoundException extends CustomHttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.NOT_FOUND);
  }
}

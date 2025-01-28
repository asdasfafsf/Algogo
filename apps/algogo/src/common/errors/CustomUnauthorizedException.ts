import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './CustomHttpException';

export class CustomUnauthorizedException extends CustomHttpException {
  constructor(customError: CustomError) {
    super(customError, HttpStatus.UNAUTHORIZED);
  }
}

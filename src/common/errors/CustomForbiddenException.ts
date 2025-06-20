import { CustomHttpException } from './CustomHttpException';
import { HttpStatus } from '@nestjs/common';
import { CustomError } from '../types/error.type';

export class CustomForbiddenException extends CustomHttpException {
  constructor(customError: CustomError) {
    super(customError, HttpStatus.FORBIDDEN);
  }
}

import { HttpStatus } from '@nestjs/common';
import { CustomError } from '../types/error.type';
import { CustomHttpException } from './CustomHttpException';

export class CustomTooManyRequestsException extends CustomHttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.TOO_MANY_REQUESTS);
  }
}

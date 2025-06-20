import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './CustomHttpException';
import { CustomError } from '../types/error.type';

export class CustomUnauthorizedException extends CustomHttpException {
  constructor(customError: CustomError) {
    super(customError, HttpStatus.UNAUTHORIZED);
  }
}

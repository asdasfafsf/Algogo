import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomError } from '../types/error.type';

export class CustomTooManyRequestsException extends HttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.TOO_MANY_REQUESTS);
  }
}

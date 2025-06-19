import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomError } from '../types/error.type';

export class CustomHttpException extends HttpException {
  constructor(customError: CustomError, status: HttpStatus) {
    super(customError, status);
  }
}

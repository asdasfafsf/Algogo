import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(customError: CustomError, status: HttpStatus) {
    super(customError, status);
  }
}

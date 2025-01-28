import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomTooManyRequestsException extends HttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.TOO_MANY_REQUESTS);
  }
}

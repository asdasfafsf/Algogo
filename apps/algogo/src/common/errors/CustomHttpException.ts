import { HttpException, HttpStatus } from '@nestjs/common';

export default class CustomHttpException extends HttpException {
  constructor(customError: CustomError, status: HttpStatus) {
    super(customError, status);
  }
}

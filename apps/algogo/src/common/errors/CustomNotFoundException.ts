import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomNotFoundException extends HttpException {
  constructor(error: CustomError) {
    super(error, HttpStatus.NOT_FOUND);
  }
}

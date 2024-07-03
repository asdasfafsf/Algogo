import { HttpStatus } from '@nestjs/common';

export class ResponseDto<T> {
  statusCode: HttpStatus;
  errorCode: string;
  errorMessage: string;
  data: T;
}

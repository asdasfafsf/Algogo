import { HttpStatus } from '@nestjs/common';

export class SocketResponseErrorDto<T> {
  seq: string;
  status: HttpStatus;
  message: string;
  data: T;
}

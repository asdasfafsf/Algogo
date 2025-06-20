import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ enum: HttpStatus, example: 200 })
  statusCode: HttpStatus;

  @ApiProperty({ example: '0000' })
  errorCode: string;

  @ApiProperty({ example: '정상' })
  errorMessage: string;

  @ApiProperty()
  data: T;
}

import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiBadRequestErrorResponse() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: '유효성 오류',
      schema: {
        example: {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: '9999',
          errorMessage: '유효성 오류',
          data: null,
        },
      },
    }),
  );
}

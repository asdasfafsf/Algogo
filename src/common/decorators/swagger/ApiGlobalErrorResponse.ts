import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  EXPIRRED_JWT_MESSAGE,
  INTERNAL_SERVER_ERROR_MESSAGE,
  INVALID_JWT_MESSAGE,
  NO_JWT_MESSAGE,
} from '../../constants/ErrorMessage';

export function ApiGlobalErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: '인증 관련 오류',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: HttpStatus.UNAUTHORIZED },
              errorCode: { type: 'string', example: '9999' },
              errorMessage: { type: 'string', example: 'JWT 관련 오류' },
              data: { type: 'null', example: null },
            },
          },
          examples: {
            expiredJwt: {
              summary: 'Expired JWT',
              value: {
                statusCode: HttpStatus.UNAUTHORIZED,
                errorCode: '9999',
                errorMessage: EXPIRRED_JWT_MESSAGE,
                data: null,
              },
            },
            noJwt: {
              summary: 'No JWT Provided',
              value: {
                statusCode: HttpStatus.UNAUTHORIZED,
                errorCode: '9999',
                errorMessage: NO_JWT_MESSAGE,
                data: null,
              },
            },
            invalidJwt: {
              summary: 'Invalid JWT',
              value: {
                statusCode: HttpStatus.UNAUTHORIZED,
                errorCode: '9999',
                errorMessage: INVALID_JWT_MESSAGE,
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: '서버 내부 오류',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number',
                example: HttpStatus.INTERNAL_SERVER_ERROR,
              },
              errorCode: { type: 'string', example: '9999' },
              errorMessage: {
                type: 'string',
                example: INTERNAL_SERVER_ERROR_MESSAGE,
              },
              data: { type: 'null', example: null },
            },
          },
          example: {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorCode: '9999',
            errorMessage: INTERNAL_SERVER_ERROR_MESSAGE,
            data: null,
          },
        },
      },
    }),
  );
}

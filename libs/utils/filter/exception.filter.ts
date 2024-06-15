import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const statusCode =
      exception instanceof HttpException
        ? exception?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorCode = '';
    const errorMessage =
      exception instanceof HttpException
        ? exception?.message ?? '정의되지 않은 오류가 발생하였습니다.'
        : '정의되지 않은 오류가 발생하였습니다.';

    const responseBody = {
      statusCode,
      errorCode,
      errorMessage,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}

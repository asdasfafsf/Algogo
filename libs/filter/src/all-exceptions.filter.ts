import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomHttpException } from 'apps/algogo/src/common/errors/CustomHttpException';
import { Logger } from 'winston';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const isDevelopment = process.env.NODE_ENV === 'development';

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage = '정의되지 않은 오류가 발생하였습니다.';
    let errorCode = '';
    if (exception instanceof CustomHttpException) {
      const customError = exception.getResponse() as CustomError;
      errorCode = customError.code;
      errorMessage = customError.message;
    } else if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response['message']) {
        if (Array.isArray(response['message'])) {
          errorMessage = isDevelopment
            ? response['message'].join(', ')
            : response['message'][0];
        } else {
          errorMessage = response['message'];
        }
      } else {
        errorMessage = exception.message;
      }
    }

    const stackTrace = (exception as any)?.stack || 'No stack trace available';

    if (
      statusCode === HttpStatus.INTERNAL_SERVER_ERROR ||
      process.env.NODE_ENV === 'development'
    ) {
      this.logger.error(`INTERNAL_SERVER_ERROR`, {
        ip: request.ip,
        url: request.url,
        exception: exception.toString(),
        stackTrace: process.env.NODE_ENV === 'development' ? stackTrace : '',
        errorMessage,
        headers: request.headers,
      });
    }

    const responseBody = {
      statusCode,
      errorCode,
      errorMessage,
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
}

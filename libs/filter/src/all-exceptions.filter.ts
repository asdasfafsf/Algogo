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

    const statusCode =
      exception instanceof HttpException
        ? exception?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorCode = '';
    const errorMessage =
      exception instanceof HttpException
        ? exception?.message ?? '정의되지 않은 오류가 발생하였습니다.'
        : '정의되지 않은 오류가 발생하였습니다.';

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`INTERNAL_SERVER_ERROR`, {
        ip: request.ip,
        url: request.url,
        headers: request.headers,
      });
    }

    const responseBody = {
      statusCode,
      errorCode,
      errorMessage,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}

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
import { ConfigType } from '@nestjs/config';
import { CustomHttpException } from '../common/errors/CustomHttpException';
import { CustomError } from '../common/types/error.type';
import appConfig from '../config/appConfig';
import { AppLogger } from '../logger/app-logger';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly isDevelopment: boolean;

  constructor(
    private readonly logger: AppLogger,
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>,
  ) {
    this.isDevelopment = appCfg.isDevelopment;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const isDevelopment = this.isDevelopment;

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
      const exceptionResponse = exception.getResponse() as Record<
        string,
        unknown
      >;
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse['message']
      ) {
        if (Array.isArray(exceptionResponse['message'])) {
          errorMessage = isDevelopment
            ? exceptionResponse['message'].join(', ')
            : exceptionResponse['message'][0];
        } else {
          errorMessage = exceptionResponse['message'] as string;
        }
      } else {
        errorMessage = exception.message;
      }
    }

    const stackTrace =
      exception instanceof Error
        ? (exception.stack ?? 'No stack trace available')
        : 'No stack trace available';

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR || isDevelopment) {
      this.logger.error(`INTERNAL_SERVER_ERROR`, {
        ip: request.ip,
        path: request.path,
        exception:
          exception instanceof Error ? exception.toString() : String(exception),
        stackTrace: isDevelopment ? stackTrace : '',
        errorMessage,
        headers: {
          'user-agent': request.headers['user-agent'],
          'x-request-id': request.headers['x-request-id'],
        },
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

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error('oauth exception', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorMessage =
      exception instanceof HttpException
        ? exception.message || '정의되지 않은 오류가 발생하였습니다'
        : '정의되지 않은 오류가 발생하였습니다';

    response
      .status(302)
      .redirect(
        process.env.NODE_ENV === 'development'
          ? `http://localhost:5173/error?message=${errorMessage}`
          : `/error?message=${errorMessage}`,
      );
  }
}

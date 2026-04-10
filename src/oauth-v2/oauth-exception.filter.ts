import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Inject,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { AppLogger } from '../logger/app-logger';
import appConfig from '../config/appConfig';

@Injectable()
@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLogger,
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error('oauth exception', { exception: String(exception) });

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorMessage =
      exception instanceof HttpException
        ? exception.message || '정의되지 않은 오류가 발생하였습니다'
        : '정의되지 않은 오류가 발생하였습니다';

    const baseUrl = this.appCfg.isDevelopment
      ? this.appCfg.frontendUrl
      : '';

    response
      .status(302)
      .redirect(`${baseUrl}/error?message=${errorMessage}`);
  }
}

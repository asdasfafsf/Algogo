import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { CustomHttpException } from '../../common/errors/CustomHttpException';
import { CustomError } from '../../common/types/error.type';
import { AppLogger } from '../../logger/app-logger';

@Catch()
export class ExecuteWsExceptionFilter implements WsExceptionFilter {
  constructor(private readonly logger: AppLogger) {}
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    if (exception instanceof CustomHttpException) {
      this.logger.error('error', exception.getResponse() as Record<string, unknown>);

      const customError = exception.getResponse() as CustomError;
      client.emit('error', {
        code: customError.code,
        result: customError.message,
      });
      return;
    }

    this.logger.error('error', { exception: String(exception) });

    client.emit('error', {
      code: '9999',
      result: '정의되지 않은 오류가 발생하였습니다.',
    });
  }
}

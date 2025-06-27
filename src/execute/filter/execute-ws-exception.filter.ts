import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { CustomHttpException } from '../../common/errors/CustomHttpException';
import { CustomError } from '../../common/types/error.type';
import { CustomLogger } from '../../logger/custom-logger';

@Catch()
export class ExecuteWsExceptionFilter implements WsExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    if (exception instanceof CustomHttpException) {
      this.logger.error('error', exception.getResponse());

      const customError = exception.getResponse() as CustomError;
      client.emit('error', {
        code: customError.code,
        result: customError.message,
      });
      return;
    }

    this.logger.error('error', exception);

    client.emit('error', {
      code: '9999',
      result: '정의되지 않은 오류가 발생하였습니다.',
    });
  }
}

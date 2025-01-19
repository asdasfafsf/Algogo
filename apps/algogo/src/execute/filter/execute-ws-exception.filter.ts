import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import CustomHttpException from '../../common/errors/CustomHttpException';

@Catch()
export class ExecuteWsExceptionFilter implements WsExceptionFilter {
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    
    if (exception instanceof CustomHttpException) {
      const customError = exception.getResponse() as CustomError;
      client.emit('error', {
        code: customError.code,
        result: customError.message,
      });
      return;
    }



    client.emit('error', {
      code: '9999',
      result: '정의되지 않은 오류가 발생하였습니다.'
    });
  }
}
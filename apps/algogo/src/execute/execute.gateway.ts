import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';

@WebSocketGateway()
export class ExecuteGateway {
  constructor(private readonly executeService: ExecuteService) {}

  @SubscribeMessage('execute')
  async handleMessage(@MessageBody() requestExecuteDto: RequestExecuteDto) {
    try {
      const response = await this.executeService.execute(requestExecuteDto);
      return response;
    } catch (e) {
      return {
        code: '9999',
        message: '예외 오류',
      };
    }
  }
}

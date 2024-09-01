import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ExecuteGateway {
  constructor(private readonly executeService: ExecuteService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('server init');
  }
  handleConnection(client: Socket) {
    console.log('handle connection');
  }
  handleDisconnect(client: Socket) {}

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

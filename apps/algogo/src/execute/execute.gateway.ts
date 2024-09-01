import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway()
export class ExecuteGateway {
  constructor(private readonly executeService: ExecuteService) {}

  @SubscribeMessage('execute')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async handleMessage(@MessageBody() requestExecuteDto: RequestExecuteDto) {
    const { seq } = requestExecuteDto;
    try {
      const response = await this.executeService.execute(requestExecuteDto);
      return response;
    } catch (e) {
      if (e instanceof BadRequestException) {
        return {
          seq,
          code: '9999',
          result: e.message,
        };
      }
      return {
        seq,
        code: '9999',
        result: '예외 오류',
      };
    }
  }
}

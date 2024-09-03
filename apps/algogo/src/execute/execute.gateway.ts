import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws.auth.guard';
import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { RedisService } from '../redis/redis.service';
import WsConfig from '../config/wsConfig';
import { ConfigType } from '@nestjs/config';

class AuthSocket extends Socket {
  messageCount: number;
  userNo: string;
}

@WebSocketGateway()
@Injectable()
export class ExecuteGateway {
  constructor(
    private readonly executeService: ExecuteService,
    private readonly wsAuthGurad: WsAuthGuard,
    @Inject('winston')
    private readonly logger: Logger,
    @Inject(WsConfig.KEY)
    private readonly wsConfig: ConfigType<typeof WsConfig>,
    private readonly redisService: RedisService,
  ) {}

  @WebSocketServer()
  private server: Server;

  async handleConnection(socket: AuthSocket) {
    const context = { switchToWs: () => ({ getClient: () => socket }) };
    const isAuthorized = await this.wsAuthGurad.canActivate(context as any);
    if (!isAuthorized) {
      socket.disconnect();
      return;
    }

    const { userNo, id } = socket;
    const preSocketId = await this.redisService.get(
      `${this.wsConfig.wsTag}_${userNo}`,
    );

    if (preSocketId) {
      const prevSocket = this.server.sockets.sockets.get(preSocketId);
      if (prevSocket?.connected) {
        prevSocket.disconnect();
      }
    }

    await this.redisService.set(`${this.wsConfig.wsTag}_${userNo}`, id);
    socket.messageCount = 0;
  }

  async handleDisconnect(socket: AuthSocket) {
    const { userNo } = socket;

    const savedSocketId = await this.redisService.get(
      `${this.wsConfig.wsTag}_${userNo}`,
    );

    if (savedSocketId === socket.id) {
      await this.redisService.del(`${this.wsConfig.wsTag}_${userNo}`);
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('execute')
  async handleExecute(
    @MessageBody() requestExecuteDto: RequestExecuteDto,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    socket.messageCount++;
    const { messageCount } = socket;
    const { seq } = requestExecuteDto;

    if (messageCount >= 1) {
      socket.messageCount--;
      return {
        seq,
        status: HttpStatus.BAD_REQUEST,
        message: '동시요청 제한 횟수를 초과하였습니다.',
        data: '',
      };
    }

    try {
      const response = await this.executeService.execute(requestExecuteDto);
      socket.messageCount--;
      return {
        seq,
        status: HttpStatus.OK,
        message: '',
        data: response,
      };
    } catch (e) {
      socket.messageCount--;
      if (e instanceof BadRequestException) {
        return {
          seq,
          status: HttpStatus.BAD_REQUEST,
          message: e.message,
          data: '',
        };
      }
      return {
        seq,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '예외 오류',
        data: '',
      };
    }
  }
}

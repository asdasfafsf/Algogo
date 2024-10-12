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
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws.auth.guard';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import WsConfig from '../config/wsConfig';
import { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { CustomLogger } from '../logger/custom-logger';
import { RequestWsAuthDto } from './dto/RequestWsAuthDto';
import { OnEvent } from '@nestjs/event-emitter';
import { CryptoService } from '../crypto/crypto.service';

class AuthSocket extends Socket {
  messageCount: number;
  userNo: string;
  token: string;
  lastRequestTime: number;
}

@WebSocketGateway()
@Injectable()
export class ExecuteGateway {
  constructor(
    private readonly executeService: ExecuteService,
    private readonly wsAuthGurad: WsAuthGuard,
    private readonly logger: CustomLogger,
    @Inject(WsConfig.KEY)
    private readonly wsConfig: ConfigType<typeof WsConfig>,
    private readonly redisService: RedisService,
    private readonly cryptoServoce: CryptoService,
  ) {}

  @WebSocketServer()
  private server: Server;

  private auth(socket: AuthSocket) {
    return new Promise<boolean>(async (resolve) => {
      setTimeout(() => {
        if (socket.disconnected) {
          resolve(false);
        }

        if (!socket.token) {
          socket.disconnect();
          resolve(false);
        }

        if (!socket.userNo) {
          socket.disconnect();
          resolve(false);
        }

        resolve(false);
      }, 5000);
    });
  }

  async handleConnection(socket: AuthSocket) {
    this.logger.silly(`start connection socket id : ${socket.id}`);
    const isOk = await this.auth(socket);

    if (!isOk) {
      return;
    }

    this.logger.silly(`connected id : ${socket.id}`);

    const { userNo, id } = socket;
    const preSocketId = await this.redisService.get(
      `${this.wsConfig.wsTag}_${userNo}`,
    );

    await this.redisService.set(`${this.wsConfig.wsTag}_${userNo}`, id);

    if (preSocketId) {
      const prevSocket = this.server.sockets.sockets.get(preSocketId);
      this.logger.silly(`prev socket id : ${prevSocket?.id}`);
      if (prevSocket?.connected) {
        prevSocket.disconnect();
      }
    }

    socket.lastRequestTime = Math.floor(new Date().getTime() / 1000);
    socket.messageCount = 0;
  }

  async handleDisconnect(socket: AuthSocket) {
    this.logger.silly('disconnect');
    const { userNo } = socket;

    const savedSocketId = await this.redisService.get(
      `${this.wsConfig.wsTag}_${userNo}`,
    );

    if (!savedSocketId || savedSocketId === socket.id) {
      this.logger.silly(`remove prev socket : ${savedSocketId}`);
      await this.redisService.del(`${this.wsConfig.wsTag}_${userNo}`);
    }
  }

  @SubscribeMessage('auth')
  async handleAuth(
    @MessageBody() requestWsAuthDto: RequestWsAuthDto,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { token } = requestWsAuthDto;
    socket.token = token;

    const context = {
      switchToWs: () => ({
        getClient: () => socket,
      }),
    };
    const isOk = await this.wsAuthGurad.canActivate(
      context as ExecutionContext,
    );

    socket.lastRequestTime = Math.floor(new Date().getTime() / 1000);

    if (!isOk) {
      socket.disconnect();
    }

    this.logger.silly('success auth');

    return true;
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
    @MessageBody() requestExecuteDto: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    socket.messageCount++;
    const { messageCount } = socket;
    const { seq } = requestExecuteDto;
    const { id } = socket;
    const requestRunDto = { id, ...requestExecuteDto };

    this.logger.silly('execute', requestRunDto);

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
      socket.lastRequestTime = Math.floor(new Date().getTime() / 1000);
      const response = await this.executeService.run(requestRunDto);
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

  @Cron('0 * * * *')
  async clearConnection() {
    this.logger.silly('Clearing all socket connections from Redis');

    const pattern = `${this.wsConfig.wsTag}_*`;
    const keys = await this.redisService.keys(pattern);
    const currentDateTime = Math.floor(new Date().getTime() / 1000);
    for (const key of keys) {
      const socketId = await this.redisService.get(key);

      if (socketId) {
        const socket = this.server.sockets.sockets.get(socketId) as AuthSocket;

        if (socket) {
          if (currentDateTime - socket.lastRequestTime > 60 * 59) {
            socket.disconnect();
          }
        }
      }
    }
  }

  @OnEvent('execute.*')
  async subscribeExecute(payload: any, socketId: string) {
    this.logger.silly('execute result', payload);
    this.server.to(socketId).emit('execute', payload);
  }

  @OnEvent('compile.*')
  async subscribeCompile(payload: any, socketId: string) {
    this.logger.silly('compile completed');
  }
}

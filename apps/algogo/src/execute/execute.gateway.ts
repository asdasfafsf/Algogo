import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ExecuteService } from './execute.service';
import {
  ExecutionContext,
  Inject,
  Injectable,
  UseFilters,
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
import CustomHttpException from '../common/errors/CustomHttpException';
import { ExecuteWsExceptionFilter } from './filter/execute-ws-exception.filter';

class AuthSocket extends Socket {
  messageCount: number;
  userNo: string;
  token: string;
  lastRequestTime: number;
  authErrorCount: number;
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
  ) {}

  @WebSocketServer()
  private server: Server;

  async handleConnection(socket: AuthSocket) {
    this.logger.silly(`start connection socket id : ${socket.id}`);

    const timeout = setTimeout(async () => {
      await this.redisService.unsubscribe(socket.id);
      socket.disconnect();
    }, 5000);
    await this.redisService.subscribe(socket.id);
    clearTimeout(timeout);

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
    this.logger.silly('handleDisConnect');
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
    try {
      this.logger.silly('requestWsAuthDto', requestWsAuthDto);
      const { token } = requestWsAuthDto;
      socket.token = token;

      const context = {
        switchToWs: () => ({
          getClient: () => socket,
        }),
      };

      this.logger.silly('start auth');
      await this.wsAuthGurad.canActivate(context as ExecutionContext);
      this.logger.silly('auth success');

      this.logger.silly('token', {
        token,
      });

      this.redisService.publish(socket.id, 'OK');
      this.logger.silly('success auth');

      socket.emit('auth', {
        code: '0000',
        result: '',
      });
    } catch (e) {
      if (e instanceof CustomHttpException) {
        const response = e.getResponse() as CustomError;
        const { code, message } = response;
        socket.emit('auth', {
          code,
          message,
          result: '',
        });
        this.redisService.publish(socket.id, 'TOKEN_EXPIRED');
        socket.disconnect();
      }
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseGuards(WsAuthGuard)
  @UseFilters(ExecuteWsExceptionFilter)
  @SubscribeMessage('execute')
  async handleExecute(
    @MessageBody() requestExecuteDto: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { id } = socket;
    const requestRunDto = { id, ...requestExecuteDto };
    socket.lastRequestTime = new Date().getTime();
    this.logger.silly('execute', requestRunDto);

    try {
      const response = await this.executeService.run(requestRunDto);
      return response;
    } catch (e) {
      if (e instanceof CustomHttpException) {
        const response = e.getResponse() as CustomError;
        const { code, message } = response;
        return {
          code,
          result: message,
          processTime: 0,
          memory: 0,
        };
      }

      return {
        code: '9999',
        result: '예외 오류',
        processTime: 0,
        memory: 0,
      };
    } finally {
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
            this.logger.silly('Clearing socket connection');
            socket.disconnect();
          }
        }
      }
    }
  }

  @OnEvent('execute')
  async subscribeExecute(payload: any) {
    this.logger.silly('execute result', payload);
    const { id } = payload;
    this.server.to(id).emit('executeResult', { ...payload, id: undefined });
  }
}

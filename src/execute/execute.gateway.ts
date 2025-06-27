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
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import WsConfig from '../config/wsConfig';
import { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { CustomLogger } from '../logger/custom-logger';
import { RequestWsAuthDto } from './dto/RequestWsAuthDto';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomHttpException } from '../common/errors/CustomHttpException';
import { ExecuteWsExceptionFilter } from './filter/execute-ws-exception.filter';
import { CustomError } from '../common/types/error.type';
import { TokenUser } from '../common/types/request.type';
import { WsAuthGuard } from '../auth-guard/ws.auth.guard';
import { ExecutionRateLimitGuard } from '../rate-limit/execution-rate-limit.guard';
import { ExecutionRateLimitInterceptor } from '../rate-limit/execution-rate-limit.interceptor';

class AuthSocket extends Socket {
  messageCount: number;
  user: TokenUser;
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
    const timeout = setTimeout(async () => {
      await this.redisService.unsubscribe(socket.id);
      socket.disconnect();
    }, 5000);
    await this.redisService.subscribe(socket.id);
    clearTimeout(timeout);

    const { user, id } = socket;

    if (!user) {
      socket.disconnect();
      return;
    }

    const preSocketId = await this.redisService.get(
      `${this.wsConfig.wsTag}_${user.sub}`,
    );

    await this.redisService.set(`${this.wsConfig.wsTag}_${user.sub}`, id);

    if (preSocketId) {
      const prevSocket = this.server.sockets.sockets.get(preSocketId);
      if (prevSocket?.connected) {
        prevSocket.disconnect();
      }
    }

    socket.lastRequestTime = Math.floor(new Date().getTime() / 1000);
    socket.messageCount = 0;
  }

  async handleDisconnect(socket: AuthSocket) {
    const { user } = socket;

    const savedSocketId = await this.redisService.get(
      `${this.wsConfig.wsTag}_${user?.sub}`,
    );

    if (!savedSocketId || savedSocketId === socket.id) {
      await this.redisService.del(`${this.wsConfig.wsTag}_${user?.sub}`);
    }
  }

  @SubscribeMessage('auth')
  async handleAuth(
    @MessageBody() requestWsAuthDto: RequestWsAuthDto,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    try {
      const { token } = requestWsAuthDto;
      socket.token = token;

      const context = {
        switchToWs: () => ({
          getClient: () => socket,
        }),
      };

      await this.wsAuthGurad.canActivate(context as ExecutionContext);
      this.redisService.publish(socket.id, 'OK');
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
  @UseGuards(WsAuthGuard, ExecutionRateLimitGuard)
  @UseFilters(ExecuteWsExceptionFilter)
  @UseInterceptors(ExecutionRateLimitInterceptor)
  @SubscribeMessage('execute')
  async handleExecute(
    @MessageBody() requestExecuteDto: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { id } = socket;
    const requestRunDto = { id, ...requestExecuteDto };
    socket.lastRequestTime = new Date().getTime();

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

  @OnEvent('execute')
  async subscribeExecute(payload: any) {
    const { id } = payload;
    this.server.to(id).emit('executeResult', { ...payload, id: undefined });
  }
}

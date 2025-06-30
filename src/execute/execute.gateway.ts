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
    socket.lastRequestTime = Math.floor(new Date().getTime() / 1000);
    const timeout = setTimeout(async () => {
      await this.redisService.unsubscribe(socket.id);
      socket.disconnect();
    }, 5000);
    await this.redisService.subscribe(socket.id);
    clearTimeout(timeout);

    const { user } = socket;

    if (!user) {
      socket.disconnect();
      return;
    }

    socket.messageCount = 0;
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
    socket.lastRequestTime = Math.floor(new Date().getTime() / 1000);

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
    const now = Math.floor(new Date().getTime() / 1000);
    const tenMinutesAgo = now - 600; // 10분 = 600초

    const connectedSockets = this.server.sockets.sockets;

    for (const [socketId, socket] of connectedSockets) {
      const authSocket = socket as AuthSocket;

      // lastRequestTime이 10분 이상 지났거나 설정되지 않은 경우
      if (
        !authSocket.lastRequestTime ||
        authSocket.lastRequestTime < tenMinutesAgo
      ) {
        this.logger.log(
          `비활성 소켓 정리: ${socketId}, 마지막 요청 시간: ${authSocket.lastRequestTime || 'undefined'}`,
        );
        // 소켓 연결 종료
        authSocket.disconnect();
      }
    }

    this.logger.log(`커넥션 정리 완료. 총 연결 수: ${connectedSockets.size}`);
  }

  @OnEvent('execute')
  async subscribeExecute(payload: any) {
    const { id, ...message } = payload;
    this.server.to(id).emit('executeResult', message);
  }
}

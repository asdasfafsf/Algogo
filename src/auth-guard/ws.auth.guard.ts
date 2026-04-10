import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CustomLogger } from '../logger/custom-logger';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CustomLogger,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const encryptedToken = this.extractTokenFromClient(client);

      if (!encryptedToken) {
        throw new WsException('토큰이 없습니다.');
      }

      const decodedToken = await this.jwtService.verify(encryptedToken);
      client.user = decodedToken;
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }

  private extractTokenFromClient(client: Socket & { token?: string }): string | undefined {
    return client.token ?? undefined;
  }
}

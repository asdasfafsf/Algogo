import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { CustomLogger } from '../logger/custom-logger';
import { AuthService } from './auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: CustomLogger,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const encryptedToken = this.extractTokenFromClient(client);

      if (!encryptedToken) {
        throw new WsException('토큰이 없습니다.');
      }

      this.logger.silly('token', {
        encryptedToken,
      });

      const decodedToken = await this.authService.decodeJwt(encryptedToken);
      const { userNo } = decodedToken;

      client.userNo = userNo;
      return true;
    } catch (e) {
      this.logger.silly('error', e);
      return false;
    }
  }

  private extractTokenFromClient(client: any): string | undefined {
    return client.token ?? undefined;
  }
}

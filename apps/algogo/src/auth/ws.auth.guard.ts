import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from '../crypto/crypto.service';
import EncryptConfig from '../config/encryptConfig';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly cryptoService: CryptoService,
    @Inject(EncryptConfig.KEY)
    private readonly encryptConfig: ConfigType<typeof EncryptConfig>,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    // const data = context.switchToWs().getData();

    const encryptedToken = this.extractTokenFromClient(client);

    if (!encryptedToken) {
      throw new WsException('토큰이 없습니다.');
    }

    const hashedToken = this.cryptoService.SHA256(encryptedToken, 5);
    const prePayload = await this.redisService.get(hashedToken);
    if (prePayload) {
      this.redisService.set(encryptedToken, prePayload, 300);
      client.userNo = prePayload;
      return true;
    }

    let decryptedToken = this.cryptoService.decryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      encryptedToken,
    );

    if (!decryptedToken.includes(this.encryptConfig.tag)) {
      decryptedToken = this.cryptoService.decryptAES(
        this.encryptConfig.prevKey,
        this.encryptConfig.prevIv,
        encryptedToken,
      );

      if (!decryptedToken.includes(this.encryptConfig.prevTag)) {
        throw new WsException('토큰 검증에 실패하였습니다.');
      }
    }

    if (!decryptedToken) {
      throw new WsException('토큰 검증에 실패하였습니다.');
    }

    decryptedToken = decryptedToken.split('_').slice(1).join('_');

    await this.jwtService.verify(decryptedToken);

    const decodedToken = await this.jwtService.decode(decryptedToken);
    const { userNo } = decodedToken;

    if (!userNo) {
      throw new WsException('토큰 검증에 실패하였습니다.');
    }

    this.redisService.set(hashedToken, userNo.toString(), 300);

    client.userNo = userNo;
    return true;
  }

  private extractTokenFromClient(client: any): string | undefined {
    const authHeader = client.handshake?.headers['authorization'];
    const [type, token] = authHeader ? authHeader.split(' ') : [null, null];
    return type === 'Bearer' ? token : undefined;
  }
}

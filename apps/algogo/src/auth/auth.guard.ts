import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from '../crypto/crypto.service';
import EncryptConfig from '../config/encryptConfig';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';

@Injectable()
export class AuthGuard implements CanActivate {
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
    const request = context.switchToHttp().getRequest();
    const encryptedToken = this.extractTokenFromHeader(request);

    if (!encryptedToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    this.logger.silly('auth guard encryptToken', {
      encryptedToken: encryptedToken + '',
    });

    const hashedToken = this.cryptoService.SHA256(encryptedToken, 5);

    this.logger.silly('auth guard hashedToken', {
      hashedToken: hashedToken + '',
    });

    const prePayload = await this.redisService.get(hashedToken);
    if (prePayload) {
      this.logger.silly('auth guard cashing success', {
        prePayload,
      });

      this.redisService.set(encryptedToken, prePayload, 300);
      return true;
    }

    this.logger.silly('auth guard cashing fail');

    let decryptedToken = this.cryptoService.decryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      encryptedToken,
    );

    this.logger.silly('auth guard cashing decrypt', {
      decryptedToken: decryptedToken + '',
    });

    if (!decryptedToken.includes(this.encryptConfig.tag)) {
      decryptedToken = this.cryptoService.decryptAES(
        this.encryptConfig.prevKey,
        this.encryptConfig.prevIv,
        encryptedToken,
      );

      if (!decryptedToken.includes(this.encryptConfig.prevTag)) {
        throw new UnauthorizedException('토큰 검증에 실패하였습니다.');
      }
    }

    if (!decryptedToken) {
      throw new UnauthorizedException('토큰 검증에 실패하였습니다.');
    }

    this.logger.silly('auth guard decrypt previous', {
      decryptedToken: decryptedToken + '',
    });

    decryptedToken = decryptedToken.split('_').slice(1).join('_');

    this.logger.silly('auth guard decrypt complete', {
      decryptedToken: decryptedToken + '',
    });

    await this.jwtService.verify(decryptedToken);

    this.logger.silly('auth guard verify complete', {});

    const decodedToken = await this.jwtService.decode(decryptedToken);
    const { userNo } = decodedToken;

    if (!userNo) {
      throw new UnauthorizedException('토큰 검증에 실패하였습니다.');
    }

    this.redisService.set(hashedToken, userNo.toString(), 300);

    request.userNo = userNo;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.headers['authorization']?.split(' ') ?? [];
    this.logger.silly('extractTokenFromHeader', {
      type: type + '',
      token: token + '',
    });
    return type === 'Bearer' ? token : undefined;
  }
}

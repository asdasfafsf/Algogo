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
import {
  INVALID_JWT_MESSAGE,
  NO_JWT_MESSAGE,
} from '../common/constants/ErrorMessage';
import { CustomLogger } from '../logger/custom-logger';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly cryptoService: CryptoService,
    @Inject(EncryptConfig.KEY)
    private readonly encryptConfig: ConfigType<typeof EncryptConfig>,
    private readonly logger: CustomLogger,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const encryptedToken = this.extractTokenFromHeader(request);

    if (!encryptedToken) {
      throw new UnauthorizedException(NO_JWT_MESSAGE);
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

      request.userNo = Number(prePayload);
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
        throw new UnauthorizedException(INVALID_JWT_MESSAGE);
      }
    }

    if (!decryptedToken) {
      throw new UnauthorizedException(INVALID_JWT_MESSAGE);
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
      throw new UnauthorizedException(INVALID_JWT_MESSAGE);
    }

    this.redisService.set(hashedToken, userNo.toString(), 300);

    request.userNo = Number(userNo);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [typeFromHeader, tokenFromHeader] =
      request?.headers['authorization']?.split(' ') ?? [];
    if (typeFromHeader === 'Bearer' && tokenFromHeader) {
      return tokenFromHeader;
    }

    const [typeFromCookie, tokenFromCookie] =
      request?.cookies?.authorization?.split(' ') ?? [];
    if (typeFromCookie === 'Bearer' && tokenFromCookie) {
      return tokenFromCookie;
    }

    return undefined;
  }
}

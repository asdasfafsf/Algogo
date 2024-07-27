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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly cryptoService: CryptoService,
    @Inject(EncryptConfig.KEY)
    private readonly encryptConfig: ConfigType<typeof EncryptConfig>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const encryptedToken = this.extractTokenFromHeader(request);
    const hashedToken = this.cryptoService.SHA256(encryptedToken, 5);

    const prePayload = await this.redisService.get(hashedToken);

    if (prePayload) {
      this.redisService.set(encryptedToken, prePayload, 300);
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
        throw new UnauthorizedException('토큰 검증에 실패하였습니다.');
      }
    }

    if (!decryptedToken) {
      throw new UnauthorizedException('토큰 검증에 실패하였습니다.');
    }

    decryptedToken = decryptedToken.split('-').slice(1).join('-');

    await this.jwtService.verify(decryptedToken);
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
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

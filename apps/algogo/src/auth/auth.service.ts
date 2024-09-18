import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '../jwt/jwt.service';
import EncryptConfig from '../config/encryptConfig';
import { ConfigType } from '@nestjs/config';
import { CryptoService } from '../crypto/crypto.service';
import * as crypto from 'crypto';
import ResponseTokenDto from '@libs/core/dto/ResponseTokenDto';
import JwtConfig from '../config/jwtConfig';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    @Inject(EncryptConfig.KEY)
    private readonly encryptConfig: ConfigType<typeof EncryptConfig>,
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly logger: CustomLogger,
  ) {}

  async getLoginToken(uuid: string): Promise<ResponseTokenDto> {
    const accessToken = await this.redisService.get(`login_${uuid}_access`);
    const refreshToken = await this.redisService.get(`login_${uuid}_refresh`);

    if (!accessToken || !refreshToken) {
      await this.redisService.del(`login_${uuid}_access`);
      await this.redisService.del(`login_${uuid}_refresh`);

      throw new InternalServerErrorException(
        '토큰 발급 중 오류가 발생하였습니다.',
      );
    }

    this.logger.silly('OAuthService getLoginToken #1', {});
    await this.redisService.del(`login_${uuid}_access`);
    await this.redisService.del(`login_${uuid}_refresh`);

    this.logger.silly('OAuthService getLoginToken Complete from redis', {});

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateLoginToken(userNo: number) {
    let uuid = await this.generateRandom(userNo.toString());
    const accessToken = await this.jwtService.sign(
      { userNo, uuid },
      this.jwtConfig.jwtAccessTokenExpiresIn,
    );
    const refreshToken = await this.jwtService.sign(
      { uuid, userNo },
      this.jwtConfig.jwtRefreshTokenExpiresIn,
    );

    const encryptedAccessToken = this.cryptoService.encryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      `${this.encryptConfig.tag}_${accessToken}`,
    );

    const encryptedRefreshToken = this.cryptoService.encryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      `${refreshToken}_${this.encryptConfig.tag}`,
    );

    while (true) {
      const newUuid = await this.redisService.get(uuid);

      if (!newUuid) {
        break;
      }

      uuid = await this.generateRandom(userNo.toString());
    }

    await this.redisService.set(
      `login_${uuid}_access`,
      encryptedAccessToken,
      30,
    );
    await this.redisService.set(
      `login_${uuid}_refresh`,
      encryptedRefreshToken,
      30,
    );

    return uuid;
  }

  private async generateRandom(data: string) {
    return crypto
      .createHash('sha256')
      .update(data + crypto.randomUUID())
      .digest('base64');
  }
}

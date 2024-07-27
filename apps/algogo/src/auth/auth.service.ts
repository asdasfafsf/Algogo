import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '../jwt/jwt.service';
import EncryptConfig from '../config/encryptConfig';
import { ConfigType } from '@nestjs/config';
import { CryptoService } from '../crypto/crypto.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    @Inject(EncryptConfig.KEY)
    private readonly encryptConfig: ConfigType<typeof EncryptConfig>,
  ) {}

  async getLoginToken(uuid: string) {
    const accessToken = await this.redisService.get(`login_${uuid}_access`);
    const refreshToken = await this.redisService.get(`login_${uuid}_refresh`);

    await this.redisService.del(`login_${uuid}_access`);
    await this.redisService.del(`login_${uuid}_refresh`);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateLoginToken(userNo: number) {
    let uuid = await this.generateRandom(userNo.toString());
    const accessToken = await this.jwtService.sign({ userNo });
    const refreshToken = await this.jwtService.sign({ userNo });

    const encryptedAccessToken = this.cryptoService.encryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      `${this.encryptConfig.tag}_${accessToken}`,
    );

    const encryptedRefreshToken = this.cryptoService.encryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      `${this.encryptConfig.tag}_${refreshToken}`,
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

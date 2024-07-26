import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly redisService: RedisService) {}

  async test() {
    await this.redisService.set('test', 'test', 1);
    return await this.redisService.get('test');
  }

  async getLoginToken(uuid: string) {
    const accessToken = await this.redisService.get(`login_${uuid}_access`);
    const refreshToken = await this.redisService.get(`login_${uuid}_refresh`);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateLoginToken(userNo: number) {
    let uuid = await this.generateRandom(userNo.toString());

    while (true) {
      const newUuid = await this.redisService.get(uuid);

      if (!newUuid) {
        break;
      }

      uuid = await this.generateRandom(userNo.toString());
    }

    await this.redisService.set(`login_${uuid}_access`, '로그인을 해용~', 30);
    await this.redisService.set(`login_${uuid}_refresh`, '로그인을 해용~', 30);

    return uuid;
  }

  private async generateRandom(data: string) {
    return crypto
      .createHash('sha256')
      .update(data + crypto.randomUUID())
      .digest('base64');
  }
}

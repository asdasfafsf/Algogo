import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '../jwt/jwt.service';
import EncryptConfig from '../config/encryptConfig';
import { ConfigType } from '@nestjs/config';
import { CryptoService } from '../crypto/crypto.service';
import * as crypto from 'crypto';
import ResponseTokenDto from './dto/ResponseTokenDto';
import JwtConfig from '../config/jwtConfig';
import { CustomLogger } from '../logger/custom-logger';
import { AuthRepository } from './auth.repository';
import { INVALID_JWT_MESSAGE } from '../common/constants/ErrorMessage';
import { JwtInvalidTokenException } from '../jwt/errors/JwtInvalidTokenException';

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
    private readonly authRepository: AuthRepository,
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

    await this.redisService.set(`${uuid}`, refreshToken);
    await this.redisService.del(`login_${uuid}_access`);
    await this.redisService.del(`login_${uuid}_refresh`);

    this.logger.silly('OAuthService getLoginToken Complete from redis', {});

    return {
      accessToken: this.cryptoService.encryptAES(
        this.encryptConfig.key,
        this.encryptConfig.iv,
        accessToken,
      ),
      refreshToken: this.cryptoService.encryptAES(
        this.encryptConfig.key,
        this.encryptConfig.iv,
        refreshToken,
      ),
    };
  }

  async generateLoginToken(userNo: number) {
    let uuid = await this.generateRandom(userNo.toString());
    const tmpUuid = await this.generateRandom(uuid);

    const accessToken = await this.jwtService.sign(
      { userNo, uuid },
      this.jwtConfig.jwtAccessTokenExpiresIn,
    );
    const refreshToken = await this.jwtService.sign(
      { uuid, userNo, tmpUuid },
      this.jwtConfig.jwtRefreshTokenExpiresIn,
    );

    while (true) {
      const newUuid = await this.redisService.get(uuid);
      const newToken = await this.redisService.get(`login_${uuid}_access`);

      if (!newUuid && !newToken) {
        break;
      }

      uuid = await this.generateRandom(userNo.toString());
    }

    await this.redisService.set(`login_${uuid}_access`, accessToken, 30);
    await this.redisService.set(`login_${uuid}_refresh`, refreshToken, 30);

    return uuid;
  }

  async decodeJwt(encryptedToken: string) {
    const decryptedToken = this.cryptoService.decryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      encryptedToken,
    );

    this.logger.silly('decryptedToken', { decryptedToken });

    if (!decryptedToken) {
      throw new JwtInvalidTokenException();
    }
    await this.jwtService.verify(decryptedToken);
    const decodedToken = await this.jwtService.decode(decryptedToken);

    this.logger.silly('decodedToken', { decodedToken });
    if (!decodedToken.userNo) {
      throw new JwtInvalidTokenException();
    }
    this.logger.silly('start get USer');

    const user = await this.authRepository.getUser(decodedToken.userNo);

    this.logger.silly('end get User');
    if (!user) {
      throw new NotFoundException('일치하는 회원이 없습니다.');
    }

    if (user.state !== 'ACTIVE') {
      throw new UnauthorizedException('활동가능한 상태가 아닙니다.');
    }

    return decodedToken;
  }

  async refreshToken(token: string) {
    const decryptedToken = this.cryptoService.decryptAES(
      this.encryptConfig.key,
      this.encryptConfig.iv,
      token,
    );
    const decodedToken = await this.jwtService.decode(decryptedToken);
    const { uuid, userNo } = decodedToken;
    const savedToken = await this.redisService.get(`${uuid}`);

    await this.redisService.del(uuid);

    if (savedToken !== decryptedToken) {
      throw new ForbiddenException(
        '유효하지 않은 토큰입니다. 다시 로그인해주세요.',
      );
    }

    const user = await this.authRepository.getUser(userNo);

    if (!user) {
      throw new NotFoundException('찾을 수 없는 회원입니다.');
    }

    if (user?.state !== 'ACTIVE') {
      throw new BadRequestException('활동가능한 상태가 아닙니다.');
    }

    let newUuid = await this.generateRandom(userNo.toString());
    while (true) {
      const tmpUuid = await this.redisService.get(newUuid);

      if (!tmpUuid) {
        break;
      }

      newUuid = await this.generateRandom(userNo.toString());
    }

    const tmpUuid = await this.generateRandom(userNo.toString());
    const accessToken = await this.jwtService.sign(
      { uuid: newUuid, userNo },
      this.jwtConfig.jwtAccessTokenExpiresIn,
    );
    const refreshToken = await this.jwtService.sign(
      { userNo, uuid: newUuid, tmpUuid },
      this.jwtConfig.jwtRefreshTokenExpiresIn,
    );

    const decodedRefreshToken = await this.jwtService.decode(refreshToken);

    this.redisService.set(
      newUuid,
      refreshToken,
      decodedRefreshToken.exp - decodedRefreshToken.iat,
    );

    return {
      accessToken: this.cryptoService.encryptAES(
        this.encryptConfig.key,
        this.encryptConfig.iv,
        accessToken,
      ),
      refreshToken: this.cryptoService.encryptAES(
        this.encryptConfig.key,
        this.encryptConfig.iv,
        refreshToken,
      ),
    };
  }

  private async generateRandom(data: string) {
    return crypto
      .createHash('sha256')
      .update(data + crypto.randomUUID())
      .digest('base64');
  }
}

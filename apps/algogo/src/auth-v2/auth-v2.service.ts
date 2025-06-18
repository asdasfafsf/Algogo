import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { TokenGeneratePayload, TokenPayload } from '../common/types/auth.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtInvalidTokenException } from '../common/errors/token/JwtInvalidTokenException';
import JwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';
import { CustomLogger } from '../logger/custom-logger';
@Injectable()
export class AuthV2Service {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    private readonly logger: CustomLogger
  ) {}

  /**
   * 사용자 로그인 시 토큰을 발급합니다.
   * @param userUuid - 사용자 UUID
   * @returns 발급된 토큰
   * @throws JwtInvalidTokenException - 토큰 생성 실패
   * @throws UserNotFoundException - 사용자를 찾을 수 없는 경우
   * @throws UserInactiveException - 사용자가 비활성화 상태인 경우
   */
  async login({ userUuid }: TokenPayload) {
    const user = await this.usersService.validateUser(userUuid);

    const { accessToken, refreshToken } = await this.generateToken({
      sub: user.uuid,
    });

    await this.saveRefreshToken(user.uuid, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh 토큰을 이용해 새로운 Access/Refresh 토큰을 발급합니다.
   * @param userUuid - 사용자 UUID
   * @param refreshToken - 리프레시 토큰
   * @returns 새로운 Access/Refresh 토큰
   * @throws JwtInvalidTokenException - 리프레시 토큰이 유효하지 않은 경우
   * @throws UserNotFoundException - 사용자를 찾을 수 없는 경우
   * @throws UserInactiveException - 사용자가 비활성화 상태인 경우
   */
  async refresh({
    userUuid,
    refreshToken,
  }: TokenPayload & { refreshToken: string }) {
    const user = await this.usersService.validateUser(userUuid);

    await this.validateRefreshToken(userUuid, refreshToken);
    await this.cacheManager.del(`${userUuid}:${refreshToken}`);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateToken({
        sub: user.uuid,
      });

    await this.saveRefreshToken(user.uuid, newRefreshToken);

    return { 
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * 리프레시 토큰을 캐시에 저장합니다.
   * @param userUuid - 사용자 UUID
   * @param refreshToken - 리프레시 토큰
   */
  async saveRefreshToken(userUuid: string, refreshToken: string) {
    await this.cacheManager.set(
      `${userUuid}:${refreshToken}`,
      true,
      this.jwtConfig.jwtRefreshTokenExpiresIn * 1000 + 10000, // cache-manager 버전 5부터는 ms단위로 설정해야함
    );
  }



  /**
   * 리프레시 토큰을 검증합니다.
   * @param userUuid - 사용자 UUID
   * @param refreshToken - 리프레시 토큰
   * @returns 검증된 리프레시 토큰
   * @throws JwtInvalidTokenException - 리프레시 토큰이 유효하지 않은 경우
   */
  async validateRefreshToken(userUuid: string, refreshToken: string) {
    const cachedRefreshToken = await this.cacheManager.get(
      `${userUuid}:${refreshToken}`,
    );

    if (!cachedRefreshToken) {
      throw new JwtInvalidTokenException();
    }

    return cachedRefreshToken;
  }

  /**
   * 토큰을 생성합니다.
   * @param payload - 토큰 생성 페이로드
   * @returns 생성된 토큰
   */
  async generateToken(payload: TokenGeneratePayload) {
    const accessToken = await this.jwtService.sign(
      payload,
      this.jwtConfig.jwtAccessTokenExpiresIn,
    );
    const refreshToken = await this.jwtService.sign(
      payload,
      this.jwtConfig.jwtRefreshTokenExpiresIn,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

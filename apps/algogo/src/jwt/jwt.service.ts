import { Inject, Injectable } from '@nestjs/common';
import {
  JsonWebTokenError,
  JwtService as NestJwtService,
  TokenExpiredError,
} from '@nestjs/jwt';
import jwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';
import { JwtTokenExpiredException } from './errors/JwtTokenExpiredException';
import { JwtInvalidTokenException } from './errors/JwtInvalidTokenException';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * 토큰을 생성합니다.
   * @param payload - 토큰 생성 페이로드
   * @param expiresIn - 토큰 만료 시간
   * @param secret - 토큰 생성 시 사용할 시크릿 키
   * @returns 생성된 토큰
   */
  async sign(
    payload: any,
    expiresIn?: string | number,
    secret: string = this.config.jwtSecret,
  ) {
    return await this.nestJwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  /**
   * 토큰을 검증합니다.
   * @param token - 검증할 토큰
   * @param secret - 토큰 검증 시 사용할 시크릿 키
   * @returns 검증된 토큰
   * @throws JwtTokenExpiredException - 토큰이 만료된 경우
   * @throws JwtInvalidTokenException - 토큰이 유효하지 않은 경우
   */
  async verify(token: string, secret: string = this.config.jwtSecret) {
    try {
      return await this.nestJwtService.verifyAsync(token, {
        secret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new JwtTokenExpiredException();
      }
    }

    try {
      return await this.nestJwtService.verifyAsync(token, {
        secret: this.config.prevJwtSecret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new JwtTokenExpiredException();
      } else if (error instanceof JsonWebTokenError) {
        throw new JwtInvalidTokenException();
      }

      throw new JwtInvalidTokenException();
    }
  }

  /**
   * 토큰을 디코딩합니다.
   * @param token - 디코딩할 토큰
   * @returns 디코딩된 토큰
   * @throws JwtInvalidTokenException - 토큰이 유효하지 않은 경우
   */
  async decode(token: string): Promise<JwtToken> {
    try {
      return this.nestJwtService.decode(token);
    } catch (e) {
      throw new JwtInvalidTokenException();
    }
  }
}

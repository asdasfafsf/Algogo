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
    }
  }

  async decode(token: string): Promise<JwtToken> {
    try {
      return this.nestJwtService.decode(token);
    } catch (e) {
      throw new JwtInvalidTokenException();
    }
  }
}

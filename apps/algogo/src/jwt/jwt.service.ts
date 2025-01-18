import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  JsonWebTokenError,
  JwtService as NestJwtService,
  TokenExpiredError,
} from '@nestjs/jwt';
import jwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';
import {
  EXPIRRED_JWT_MESSAGE,
  INVALID_JWT_MESSAGE,
} from '../common/constants/ErrorMessage';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async sign(
    payload: any,
    expiresIn?: number,
    secret: string = this.config.jwtSecret,
  ) {
    return await this.nestJwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async verify(token: string, secret: string = this.config.jwtSecret) {
    try {
      await this.nestJwtService.verifyAsync(token, {
        secret,
      });

      return;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(EXPIRRED_JWT_MESSAGE);
      }
    }

    try {
      await this.nestJwtService.verifyAsync(token, {
        secret: this.config.prevJwtSecret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(EXPIRRED_JWT_MESSAGE);
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(INVALID_JWT_MESSAGE);
      }
    }
  }

  async decode(token: string): Promise<JwtToken> {
    try {
      return this.nestJwtService.decode(token);
    } catch (e) {
      throw new UnauthorizedException(INVALID_JWT_MESSAGE);
    }
  }
}

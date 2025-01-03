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

  async sign(payload: any, expiresIn?: number) {
    return await this.nestJwtService.signAsync(payload, {
      secret: this.config.jwtSecret,
      expiresIn,
    });
  }

  async verify(token: string) {
    try {
      await this.nestJwtService.verifyAsync(token, {
        secret: this.config.jwtSecret,
      });

      return;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        new UnauthorizedException(EXPIRRED_JWT_MESSAGE);
      }
    }

    try {
      await this.nestJwtService.verifyAsync(token, {
        secret: this.config.prevJwtSecret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        new UnauthorizedException(EXPIRRED_JWT_MESSAGE);
      } else if (error instanceof JsonWebTokenError) {
        new UnauthorizedException(INVALID_JWT_MESSAGE);
      }
    }
  }

  async decode(token: string): Promise<JwtToken> {
    try {
      return this.nestJwtService.decode(token);
    } catch (e) {
      new UnauthorizedException(INVALID_JWT_MESSAGE);
    }
  }
}

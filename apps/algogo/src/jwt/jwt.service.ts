import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwtConfig';
import { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

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
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw {
          ...new UnauthorizedException('토큰이 만료되었습니다.'),
          errorCode: '9999',
        };
      }
    }

    try {
      await this.nestJwtService.verifyAsync(token, {
        secret: this.config.prevJwtSecret,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw {
          ...new UnauthorizedException('토큰이 만료되었습니다.'),
          errorCode: '9999',
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw {
          ...new UnauthorizedException('유효하지 않은 토큰입니다.'),
          errorCode: '9999',
        };
      }
    }
  }

  async decode(token: string) {
    try {
      return this.nestJwtService.decode(token);
    } catch (e) {
      throw {
        ...new UnauthorizedException('유효하지 않은 토큰입니다.'),
        errorCode: '9999',
      };
    }
  }
}

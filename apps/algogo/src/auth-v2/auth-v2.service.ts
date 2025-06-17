import { Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthV2Service {
  constructor(private readonly jwtService: JwtService) {}

  async login() {}

  async refresh() {}

  async generateToken(payload: unknown) {
    const accessToken = await this.jwtService.sign(payload, '1h');
    const refreshToken = await this.jwtService.sign(payload, '7d');

    return {
      accessToken,
      refreshToken,
    };
  }
}

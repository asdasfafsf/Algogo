import { Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthV2Service {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login({ userUuid }: { userUuid: string }) {
    const user = await this.usersService.validateUser(userUuid);

    const { accessToken, refreshToken } = await this.generateToken({
      sub: user.uuid,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh({ userUuid }: { userUuid: string }) {
    const user = await this.usersService.validateUser(userUuid);

    const { accessToken, refreshToken } = await this.generateToken({
      sub: user.uuid,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateToken(payload: unknown) {
    const accessToken = await this.jwtService.sign(payload, '1h');
    const refreshToken = await this.jwtService.sign(payload, '7d');

    return {
      accessToken,
      refreshToken,
    };
  }
}

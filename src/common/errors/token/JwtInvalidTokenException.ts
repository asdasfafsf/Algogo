import { CustomUnauthorizedException } from '../CustomUnauthorizedException';

export class JwtInvalidTokenException extends CustomUnauthorizedException {
  constructor() {
    super({
      code: 'JWT_INVALID',
      message: '토큰이 유효하지 않습니다.',
    });
  }
}

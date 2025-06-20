import { CustomUnauthorizedException } from '../CustomUnauthorizedException';

export class JwtMissingTokenException extends CustomUnauthorizedException {
  constructor() {
    super({
      code: 'JWT_MISSING',
      message: '토큰이 없습니다.',
    });
  }
}

import { CustomUnauthorizedException } from '../../common/errors/CustomUnAuthorizedException';

export class JwtTokenExpiredException extends CustomUnauthorizedException {
  constructor() {
    super({
      code: 'JWT_EXPIRED',
      message: '토큰이 만료되었습니다.',
    });
  }
}

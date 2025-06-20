import { CustomConflictException } from '../CustomConflictException';

export class OAuthConflictException extends CustomConflictException {
  constructor() {
    super({
      code: 'OAUTH_CONFLICT',
      message: '이미 연동된 계정입니다.',
    });
  }
}

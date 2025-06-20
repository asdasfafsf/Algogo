import { CustomForbiddenException } from '../CustomForbiddenException';

export class UserInactiveException extends CustomForbiddenException {
  constructor() {
    super({
      message: '비활성화된 유저입니다.',
      code: 'USER_INACTIVE',
    });
  }
}

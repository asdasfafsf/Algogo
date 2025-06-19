import { CustomNotFoundException } from '../CustomNotFoundException';

export class UserNotFoundException extends CustomNotFoundException {
  constructor() {
    super({
      message: '회원이 존재하지 않습니다.',
      code: 'USER_NOT_FOUND',
    });
  }
}

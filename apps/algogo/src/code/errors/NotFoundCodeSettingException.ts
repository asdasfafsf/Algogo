import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class NotFoundCodeSettingException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: '코드 설정을 찾을 수없습니다.',
    });
  }
}

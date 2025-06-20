import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class NotFoundCodeTemplateException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: '코드 템플릿을 찾을 수없습니다.',
    });
  }
}

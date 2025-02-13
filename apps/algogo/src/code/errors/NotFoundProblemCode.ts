import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class NotFoundProblemCode extends CustomNotFoundException {
  constructor() {
    super({
      code: 'NOT_FOUND_CODE',
      message: '저장된 코드가 없습니다.',
    });
  }
}

import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class NotFoundProblemCodeException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'PROBLEM_CODE_NOT_FOUND',
      message: '저장된 코드가 없습니다.',
    });
  }
}

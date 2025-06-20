import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class NotFoundProblemException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'NOT_FOUND_PROBLEM',
      message: '문제를 찾을 수 없습니다.',
    });
  }
}

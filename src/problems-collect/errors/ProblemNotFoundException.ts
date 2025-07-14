import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class ProblemNotFoundException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: '문제를 찾을 수 없습니다.',
    });
  }
}

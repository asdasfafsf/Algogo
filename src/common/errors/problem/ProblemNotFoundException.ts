import { CustomNotFoundException } from '../CustomNotFoundException';

export class ProblemNotFoundException extends CustomNotFoundException {
  constructor() {
    super({
      message: '문제를 찾을 수 없습니다.',
      code: 'PROBLEM_NOT_FOUND',
    });
  }
}

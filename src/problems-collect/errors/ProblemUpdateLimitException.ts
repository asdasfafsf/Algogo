import { CustomConflictException } from '../../common/errors/CustomConflictException';

export class ProblemUpdateLimitException extends CustomConflictException {
  constructor() {
    super({
      code: 'P9998',
      message:
        '금일 해당 문제의 업데이트가 이미 수행되었습니다. 다음 날 다시 요청해주세요',
    });
  }
}

import { CustomTooManyRequestsException } from '../../common/errors/CustomTooManyRequestsException';

export class TooManyProblemsCollectException extends CustomTooManyRequestsException {
  constructor() {
    super({
      code: 'P9997',
      message: '요청 제한에 도달했습니다.',
    });
  }
}

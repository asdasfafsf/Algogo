import { CustomNotFoundException } from '../../common/errors/CustomNotFoundException';

export class ProblemSiteNotFoundException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'NOT_FOUND',
      message: '지원하는 사이트가 아닙니다. 사이트 URL을 다시 확인하세요.',
    });
  }
}

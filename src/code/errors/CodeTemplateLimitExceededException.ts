import { CustomConflictException } from '../../common/errors/CustomConflictException';

export class CodeTemplateLimitExceededException extends CustomConflictException {
  constructor() {
    super({
      code: 'CODE_TEMPLATE_LIMIT_EXCEEDED',
      message: '설정가능한 코드 템플릿 갯수를 초과하였습니다.',
    });
  }
}

import { ApiProperty } from '@nestjs/swagger';
import ResponseCodeTemplate from './ResponseCodeTemplate';
import ResponseCodeTemplateSummary from './ResponseCodeTemplateSummary';

export default class ResponseCodeTemplateResult {
  @ApiProperty({
    type: [ResponseCodeTemplate],
    description: '기본 코드 템플릿 목록',
  })
  defaultList: ResponseCodeTemplate[];

  @ApiProperty({
    type: [ResponseCodeTemplateSummary],
    description: '코드 템플릿 요약 목록',
  })
  summaryList: ResponseCodeTemplateSummary[];
}

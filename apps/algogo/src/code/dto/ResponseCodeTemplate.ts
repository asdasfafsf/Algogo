import { ApiProperty } from '@nestjs/swagger';
import ResponseCodeTemplateSummary from './ResponseCodeTemplateSummary';

export default class ResponseCodeTemplate extends ResponseCodeTemplateSummary {
  @ApiProperty({
    description: '템플릿 내용',
    example: 'function solution() { ... }',
  })
  content: string;

  @ApiProperty({
    description: '템플릿 설명 (선택사항)',
    example: '배열을 정렬하는 기본적인 방법을 보여주는 예제입니다.',
    required: false,
    default: '',
  })
  description: string = '';
}

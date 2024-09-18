import { ApiProperty } from '@nestjs/swagger';
import { ProblemContentType } from '../enum/ProblemContentTypeEnum';

export class ResponseProblemContentDto {
  @ApiProperty({
    description: '순서',
    example: 1,
    type: Number,
  })
  order: number;
  @ApiProperty({
    description: '내용 유형',
    example: 'image',
    type: String,
  })
  type: ProblemContentType;
  @ApiProperty({
    description: 'image: url, text: tag가 포함된 text',
    example: 'https://...image',
    type: String,
  })
  content: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class ProblemInputOutputDto {
  @ApiProperty({
    description: '순서',
    example: 1,
    type: Number,
  })
  order: number;

  @ApiProperty({
    description: '입력',
    example: '1 2 3 4',
    type: String,
  })
  input: string;

  @ApiProperty({
    description: '출력',
    example: '1 2 3 4',
    type: String,
  })
  output: string;

  @ApiProperty({
    description: '설명',
    example: '첫 번째 테스트 케이스입니다.',
    required: false,
    type: String,
  })
  content?: string;
}

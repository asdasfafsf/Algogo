import { ApiProperty } from '@nestjs/swagger';

export class ResponseProblemInputOutputDto {
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
}

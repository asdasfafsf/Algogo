import { ApiProperty } from '@nestjs/swagger';

export class ResponseProblemContentCellDto {
  @ApiProperty({
    description: '행 인덱스',
    example: 1,
  })
  rowIndex: number;
  @ApiProperty({
    description: '열 인덱스',
    example: 1,
  })
  colIndex: number;
  @ApiProperty({
    description: '셀 내용',
    example: '1',
  })
  content: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { ResponseProblemSummaryDto } from './ResponseProblemSummaryDto';

export class ResponseProblemSummaryListDto {
  @ApiProperty({
    type: [ResponseProblemSummaryDto],
    description: 'List of problem summaries',
  })
  problemList: ResponseProblemSummaryDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of problems',
  })
  totalCount: number;

  @ApiProperty({
    example: 10,
    description: 'Number of problems per page',
  })
  pageSize: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  pageNo: number;
}

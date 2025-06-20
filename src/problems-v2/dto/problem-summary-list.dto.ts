import { ProblemSummaryDto } from './problem-summary.dto';

export class ProblemSummaryListDto {
  problemList: ProblemSummaryDto[];
  totalCount: number;
  pageSize: number;
  pageNo: number;
}

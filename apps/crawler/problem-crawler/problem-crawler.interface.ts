import { CralwerCookieDto } from '@libs/common/dto/CrawlerCookieDto';
import { ResponseProblemDto } from '@libs/common/dto/ResponseProblemDto';
import { ResponseProblemSummaryDto } from '@libs/common/dto/ResponseProblemSummaryDto';

export interface ProblemCralwer {
  getProblemList(
    startPage: number,
    endPage: number,
    cookies?: CralwerCookieDto[],
  ): Promise<ResponseProblemSummaryDto[]>;
  getProblem(
    key: string,
    cookies?: CralwerCookieDto[],
  ): Promise<ResponseProblemDto>;
}

import { CralwerCookieDto } from '@libs/core/dto/CrawlerCookieDto';
import { ResponseProblemDto } from '@libs/core/dto/ResponseProblemDto';
import { ResponseProblemSummaryDto } from '@libs/core/dto/ResponseProblemSummaryDto';

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

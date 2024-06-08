import { CralwerCookieDto } from '@libs/common/dto/CrawlerCookieDto';
import { ResponseProblemDto } from '@libs/common/dto/ResponseProblemDto';

export interface ProblemCralwer {
  getProblemList(cookies?: CralwerCookieDto[]): Promise<ResponseProblemDto[]>;
  getProblem(
    key: string,
    cookies?: CralwerCookieDto[],
  ): Promise<ResponseProblemDto>;
}

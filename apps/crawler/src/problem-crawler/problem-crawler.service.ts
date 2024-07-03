import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProblemCralwerFactory } from './problem-crawler-factory';
import { CralwerCookieDto } from '@libs/core/dto/CrawlerCookieDto';
import { HttpService } from '@nestjs/axios';
import { ResponseDto } from '@libs/core/dto/ResponseDto';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Logger } from 'winston';

@Injectable()
export class ProblemCrawlerService {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly problemCrawlerFactory: ProblemCralwerFactory,
  ) {}

  async getProblemList(
    crawlerSite: string,
    startPage: number = 1,
    endPage: number = 1,
    cookies?: CralwerCookieDto[],
  ) {
    const cralwer = this.problemCrawlerFactory.getInstance(crawlerSite);
    return await cralwer.getProblemList(startPage, endPage, cookies);
  }
  async getProblem(
    crawlerSite: string,
    key: string,
    cookies?: CralwerCookieDto[],
  ) {
    const cralwer = this.problemCrawlerFactory.getInstance(crawlerSite);
    const problem = await cralwer.getProblem(key, cookies);
    const contentList = await Promise.all(
      problem.contentList.map(async (content, index) => {
        if (content.type === 'image') {
          const response = await this.getResource(
            content.content,
            cralwer.requestHeaders,
          );

          if (response.statusCode !== HttpStatus.OK) {
            this.logger.error(`${ProblemCrawlerService.name} convert Image`, {
              crawlerSite,
              key,
              index,
            });
            throw new InternalServerErrorException(
              '이미지 수집 중 오류가 발생하였습니다.',
            );
          }

          return {
            type: 'image',
            content: response.data,
          };
        }
        return content;
      }),
    );

    return {
      ...problem,
      contentList,
    };
  }

  async getResource(
    url: string,
    requestHeaders: any,
  ): Promise<ResponseDto<string>> {
    const response = await firstValueFrom(
      this.httpService
        .get(url, {
          responseType: 'arraybuffer',
          headers: requestHeaders,
        })
        .pipe(
          catchError((error) => {
            const status = Number(error?.response?.status);

            if (!status) {
              this.logger.error(
                `${ProblemCrawlerService.name} getResource`,
                error,
              );
            }

            return of({
              data: Buffer.alloc(0),
              statusCode: status,
              errorCode: '9999',
              errorMessage: '크롤링 오류',
            } as ResponseDto<Buffer>);
          }),
        ),
    );

    return {
      data: Buffer.from(response.data).toString('hex'),
      statusCode: response.data.statusCode,
      errorCode: response.data.errorCode,
      errorMessage: response.data.errorMessage,
    };
  }
}

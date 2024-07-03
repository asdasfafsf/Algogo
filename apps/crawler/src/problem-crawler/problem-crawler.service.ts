import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProblemCralwerFactory } from './problem-crawler-factory';
import { CralwerCookieDto } from '@libs/core/dto/CrawlerCookieDto';
import { HttpService } from '@nestjs/axios';
import { ResponseDto } from '@libs/core/dto/ResponseDto';
import { catchError, firstValueFrom } from 'rxjs';
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
      problem.contentList.map(async ({ content, type }, order) => {
        if (type === 'image') {
          const response = await this.getResource(
            content,
            cralwer.requestHeaders,
          );

          const { data } = response;
          return {
            order,
            type: 'image',
            content: data.toString('hex'),
          };
        }
        return {
          order,
          type,
          content,
        };
      }),
    ).catch((error) => {
      this.logger.error(`${ProblemCrawlerService.name} image to Hex`, {
        ...error,
      });

      throw new InternalServerErrorException('이미지 변환 오류');
    });

    return {
      ...problem,
      contentList,
    };
  }

  async getResource(
    url: string,
    requestHeaders: any,
  ): Promise<ResponseDto<Buffer>> {
    const response = await firstValueFrom(
      this.httpService
        .get(url, {
          responseType: 'arraybuffer',
          headers: requestHeaders,
        })
        .pipe(
          catchError((error) => {
            const status = Number(error?.response?.status);

            this.logger.error(`${ProblemCrawlerService.name} getResource`, {
              status,
              requestUrl: url,
              error,
            });
            throw new InternalServerErrorException(
              '이미지 수집 중 오류가 발생하였습니다.',
            );
          }),
        ),
    );

    return {
      data: Buffer.from(response.data),
      statusCode: response.status,
      errorCode: '0000',
      errorMessage: '',
    };
  }
}

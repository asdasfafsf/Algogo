import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import crawlerConfig from '../config/crawlerConfig';
import { ConfigType } from '@nestjs/config';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ResponseDto } from '@libs/core/dto/ResponseDto';
import { ResponseProblemDto } from '@libs/core/dto/ResponseProblemDto';
import { Logger } from 'winston';

@Injectable()
export class CrawlerService {
  private readonly requestHeaders = {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    priority: 'u=0, i',
    'sec-ch-ua':
      '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    referrer: 'https://www.acmicpc.net/',
    referrerPolicy: 'strict-origin',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
  };

  constructor(
    @Inject('winston') private readonly logger: Logger,
    @Inject(crawlerConfig.KEY)
    private crawerConfig: ConfigType<typeof crawlerConfig>,
    private readonly httpService: HttpService,
  ) {}

  async getProblem(
    site: string,
    key: string,
  ): Promise<ResponseDto<ResponseProblemDto>> {
    const siteName =
      {
        BOJ: 'BOJ',
      }[site] ?? 'BOJ';

    const response = await firstValueFrom(
      this.httpService
        .get(`${this.crawerConfig.url}/problem/${siteName}/${key}`, {})
        .pipe(
          catchError((error) => {
            const status = Number(error.response.status);

            return of({
              data: {
                statusCode: status,
                errorCode: '9999',
                errorMessage: '크롤링 오류',
                data: {},
              },
            });
          }),
        ),
    );

    const data = response.data;

    this.logger.info(`${CrawlerService.name} getProblem`, {
      site: site,
      key: key,
      statusCode: data.statusCode,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      requestUrl: `${this.crawerConfig.url}/problem/${siteName}/${key}`,
    });
    return data;
  }

  async getResource(url: string): Promise<ResponseDto<Buffer>> {
    const response = await firstValueFrom(
      this.httpService
        .get(url, {
          responseType: 'arraybuffer',
          headers: this.requestHeaders,
        })
        .pipe(
          catchError((error) => {
            const status = Number(error?.response?.status);

            if (!status) {
              this.logger.error(`${CrawlerService.name} getResource`, error);
            }

            return of({
              data: {
                statusCode: status,
                errorCode: '9999',
                errorMessage: '크롤링 오류',
                data: new ArrayBuffer(0),
              },
            });
          }),
        ),
    );

    const { data } = response;

    this.logger.info(`${CrawlerService.name} getResource`, {
      requestUrl: url,
      statusCode: data.statusCode,
      errorCode: data.errorCode,
      // data: data.data
    });
    return {
      statusCode: HttpStatus.OK,
      errorCode: '0000',
      errorMessage: '',
      data,
    };
  }
}

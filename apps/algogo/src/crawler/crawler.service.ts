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

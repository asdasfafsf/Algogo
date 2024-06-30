import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import crawlerConfig from '../config/crawlerConfig';
import { ConfigType } from '@nestjs/config';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ResponseDto } from '@libs/core/dto/ResponseDto';
import { ResponseProblemDto } from '@libs/core/dto/ResponseProblemDto';

@Injectable()
export class CrawlerService {
  constructor(
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
            const status = Number(error.response.status);

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

    return {
      statusCode: HttpStatus.OK,
      errorCode: '0000',
      errorMessage: '크롤링 오류',
      data,
    };
  }
}

import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProblemCralwer } from './problem-crawler.interface';
import { CralwerCookieDto } from '@libs/common/dto/CrawlerCookieDto';
import { HttpService } from '@nestjs/axios';
import { ResponseProblemDto } from '@libs/common/dto/ResponseProblemDto';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AcmicpcService implements ProblemCralwer {
  constructor(private readonly httpService: HttpService) {}

  async getProblemList(cookies?: CralwerCookieDto[]) {
    const requestCookies = cookies ?? [];

    return [] as ResponseProblemDto[];
  }
  async getProblem(key: string, cookies?: CralwerCookieDto[]) {
    const requestCookies = cookies ?? [];
    const requestUrl = `https://www.acmicpc.net/problem/${key}`;
    console.log(requestUrl);
    const requestHeaders = {
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
    console.log('방가방가');
    const response = await firstValueFrom(
      this.httpService
        .get(requestUrl, {
          headers: requestHeaders,
        })
        .pipe(
          catchError((error) => {
            console.log('error');
            throw new InternalServerErrorException(error.message);
          }),
        ),
    );

    console.log('이거 원래 안보임?');
    console.log(response);
    const data = response.data;

    console.log(data);
    const responseProblemDto = this.parseProblem(data);
    return responseProblemDto;
  }

  parseProblem(data: string): ResponseProblemDto {
    const responseProblemDto = new ResponseProblemDto();
    return responseProblemDto;
  }
}

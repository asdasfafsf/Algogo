/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProblemCralwer } from './problem-crawler.interface';
import { CralwerCookieDto } from '@libs/common/dto/CrawlerCookieDto';
import { HttpService } from '@nestjs/axios';
import { ResponseProblemDto } from '@libs/common/dto/ResponseProblemDto';
import { catchError, firstValueFrom } from 'rxjs';
import { parse } from 'node-html-parser';

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

    const data = response.data;
    const responseProblemDto = this.parseProblem(data);
    return responseProblemDto;
  }

  parseProblem(data: string): ResponseProblemDto {
    const document = parse(data);
    const title = document.querySelector('#problem_title').text;
    console.log(`title: ${title}`);

    const contentList = document
      .querySelector('#problem_description')
      .childNodes.map((elem) => elem.innerText.trim())
      .filter((elem) => elem);

    const input = document
      .querySelector('#problem_input')
      .childNodes.map((elem) => elem.innerText.trim())
      .filter((elem) => elem)
      .join('\n');

    console.log(`입력 : ${input}`);

    const output = document
      .querySelector('#problem_output')
      .childNodes.map((elem) => elem.innerText.trim())
      .filter((elem) => elem)
      .join('\n');

    console.log(`출력 : ${output}`);

    const problemInfoList = document
      .querySelector('#problem-info')
      .querySelector('tbody')
      .querySelector('tr')
      .querySelectorAll('td')
      .map((elem) => elem.innerHTML);
    console.log(problemInfoList);

    const timeout = +problemInfoList[0].split(' ')[0].replace(/[^0-9]/g, '');
    const memoryLimit = +problemInfoList[1].replace(/[^0-9]/g, '');
    const submitCount = +problemInfoList[2];
    const answerCount = +problemInfoList[3];
    const answerPeopleCount = +problemInfoList[4];
    const answerRate = +problemInfoList[5].replace('%', '');

    const limit =
      document
        .querySelector('#problem_limit')
        ?.childNodes?.map((elem) => elem.innerText.trim())
        ?.filter((elem) => elem)
        ?.join('\n') ?? '';

    console.log(`제한 : ${limit}`);

    const inputOutputList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map((elem) => {
        const input =
          document
            .querySelector(`#sample-input-${elem}`)
            ?.innerText?.trim()
            .split('\n')
            .map((elem) => elem.trim())
            .join('\n') ?? '';

        const output =
          document
            .querySelector(`#sample-output-${elem}`)
            ?.innerText?.trim()
            .split('\n')
            .map((elem) => elem.trim())
            .join('\n') ?? '';

        return { input, output };
      })
      .filter((elem) => elem.input && elem.output);

    // console.log(inputOutputNodeList);
    console.log(contentList);

    const responseProblemDto = new ResponseProblemDto();
    responseProblemDto.title = title;

    return {
      title,
      contentList,
      level: '',
      typeList: [],
      answerRate,
      submitCount,
      timeout,
      memoryLimit,
      answerCount,
      answerPeopleCount,
      limit,
      input,
      output,
      inputOutputList,
    } as ResponseProblemDto;
  }
}

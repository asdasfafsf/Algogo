/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProblemCralwer } from './problem-crawler.interface';
import { CralwerCookieDto } from '@libs/core/dto/CrawlerCookieDto';
import { HttpService } from '@nestjs/axios';
import { ResponseProblemDto } from '@libs/core/dto/ResponseProblemDto';
import { catchError, firstValueFrom } from 'rxjs';
import { parse } from 'node-html-parser';
import { ResponseProblemSummaryDto } from '@libs/core/dto/ResponseProblemSummaryDto';

@Injectable()
export class AcmicpcService implements ProblemCralwer {
  private readonly tierToTextMap = {
    '1': '브론즈 5',
    '2': '브론즈 4',
    '3': '브론즈 3',
    '4': '브론즈 2',
    '5': '브론즈 1',
    '6': '실버 5',
    '7': '실버 4',
    '8': '실버 3',
    '9': '실버 2',
    '10': '실버 1',
    '11': '골드 5',
    '12': '골드 4',
    '13': '골드 3',
    '14': '골드 2',
    '15': '골드 1',
    '16': '플래티넘 5',
    '17': '플래티넘 4',
    '18': '플래티넘 3',
    '19': '플래티넘 2',
    '20': '플래티넘 1',
    '21': '다이아몬드 5',
    '22': '다이아몬드 4',
    '23': '다이아몬드 3',
    '24': '다이아몬드 2',
    '25': '다이아몬드 1',
    '26': '루비 5',
    '27': '루비 4',
    '28': '루비 3',
    '29': '루비 2',
    '30': '루비 1',
  };
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
  constructor(private readonly httpService: HttpService) {}

  async getProblemList(
    startPageNo: number,
    endPageNo: number,
    cookies?: CralwerCookieDto[],
  ) {
    const requestCookies = cookies ?? [];
    const headers = { ...this.requestHeaders };
    const requestUrl = 'https://www.acmicpc.net/problemset';

    let currentPage = startPageNo;
    const result = [];

    while (currentPage <= endPageNo) {
      const response = await firstValueFrom(
        this.httpService
          .get(`${requestUrl}/${currentPage}`, {
            headers,
          })
          .pipe(
            catchError((error) => {
              const status = Number(error.response.status);

              if (status == HttpStatus.NOT_FOUND) {
                throw new NotFoundException('can not find problem');
              }

              console.error(error);

              throw new InternalServerErrorException(error.message);
            }),
          ),
      );

      const data = response.data;
      const summrayList = this.parseProblemList(data);
      summrayList.forEach((elem) => result.push(elem));

      currentPage++;
    }

    return result;
  }

  parseProblemList(data: string) {
    return [
      ...parse(data)
        .querySelector('#problemset')
        .querySelector('tbody')
        .querySelectorAll('tr'),
    ].map((elem) => {
      const title = elem.querySelectorAll('td')[1].querySelector('a').innerText;
      const key = elem.querySelector('.list_problem_id').innerText;
      const tierImage = elem.querySelectorAll('td')[1].querySelector('img')
        ?.attributes['src'];

      return {
        title,
        key,
      };
    });
  }

  async getProblem(key: string, cookies?: CralwerCookieDto[]) {
    const requestCookies = cookies ?? [];
    const requestUrl = `https://www.acmicpc.net/problem/${key}`;
    const headers = { ...this.requestHeaders };

    const response = await firstValueFrom(
      this.httpService
        .get(requestUrl, {
          headers,
        })
        .pipe(
          catchError((error) => {
            const status = Number(error.response.status);

            if (status == HttpStatus.NOT_FOUND) {
              throw new NotFoundException('can not find problem');
            }

            console.error(error);

            throw new InternalServerErrorException(error.message);
          }),
        ),
    );

    const data = response.data;
    const responseProblemDto = this.parseProblem(data);
    responseProblemDto.key = key;

    const tierResponse = await firstValueFrom(
      this.httpService
        .get(`https://solved.ac/search?query=${key}`, { headers })
        .pipe(
          catchError((error) => {
            const status = Number(error.response.status);

            if (status == HttpStatus.NOT_FOUND) {
              throw new NotFoundException('can not find tier');
            }

            console.error(error);

            throw new InternalServerErrorException(error.message);
          }),
        ),
    );
    const tierData = tierResponse.data;
    const { level, typeList } = this.parseProblemInfo(tierData, key);
    responseProblemDto.level = level;
    responseProblemDto.typeList = typeList;
    return responseProblemDto;
  }

  parseProblem(data: string): ResponseProblemDto {
    const document = parse(data);
    const title = document.querySelector('#problem_title').text;
    // console.log(`title: ${title}`);

    const contentList = document
      .querySelector('#problem_description')
      .querySelectorAll('p')
      .map((elem) => elem.innerHTML)
      .map((elem) => {
        if (elem.indexOf('<img') > -1) {
          return {
            type: 'image',
            value: elem.split('src="')[1].split('"')[0],
          };
        }

        return {
          type: 'text',
          value: elem,
        };
      });

    const input = document
      .querySelector('#problem_input')
      .childNodes.map((elem) => elem.innerText.trim())
      .filter((elem) => elem)
      .join('\n');

    // console.log(`입력 : ${input}`);

    const output = document
      .querySelector('#problem_output')
      .childNodes.map((elem) => elem.innerText.trim())
      .filter((elem) => elem)
      .join('\n');

    // console.log(`출력 : ${output}`);

    const problemInfoList = document
      .querySelector('#problem-info')
      .querySelector('tbody')
      .querySelector('tr')
      .querySelectorAll('td')
      .map((elem) => elem.innerHTML);
    // console.log(problemInfoList);

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

    // console.log(`제한 : ${limit}`);

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
    // console.log(contentList);

    const responseProblemDto = new ResponseProblemDto();
    responseProblemDto.title = title;

    return {
      key: '',
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

  parseProblemInfo(data: string, key: string) {
    const document = parse(data);
    const propsText = document.querySelector('#__NEXT_DATA__')?.innerText;

    if (!propsText) {
      return {
        typeList: [],
        level: '',
      };
    }

    const props = JSON.parse(propsText);
    const problems = props.props.pageProps.problems.items;
    const problem = problems.find((elem) => elem.problemId === Number(key));

    if (!problem) {
      return {
        typeList: [],
        level: '',
      };
    }

    const level = this.tierToTextMap[problem.level + ''] ?? '알 수 없음';
    const typeList = problem.tags.map(
      (tag) => tag.displayNames.find((name) => name.language === 'ko').name,
    );

    return {
      level: level,
      typeList: typeList ?? [],
    };
  }
}

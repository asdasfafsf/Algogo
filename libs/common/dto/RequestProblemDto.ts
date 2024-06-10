import { RequestCralwerCookieDto } from './RequestCrawlerCookieDto';

export class RequestProblemDto {
  cookies: RequestCralwerCookieDto[];
  site: 'BOJ';
  key: string;
}

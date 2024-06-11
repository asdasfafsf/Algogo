import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProblemCrawlerService } from '../problem-crawler/problem-crawler.service';
import { ResponseDto } from '@libs/common/dto/ResponseDto';
import { RequestCralwerCookieDto } from '@libs/common/dto/RequestCrawlerCookieDto';

@Controller()
export class AppController {
  constructor(private readonly problemCrawlerService: ProblemCrawlerService) {}

  @Get('problems/:site')
  @HttpCode(HttpStatus.OK)
  async getProblemList(
    @Param('site') site: string,
    @Query('startPage') startPage: number,
    @Query('endPage') endPage: number,
  ) {
    const problemList = await this.problemCrawlerService.getProblemList(
      site,
      startPage,
      endPage,
    );

    return ResponseDto.Builder.setStatusCode(HttpStatus.OK)
      .setErrorCode('0000')
      .setErrorMessage('정상')
      .setData(problemList)
      .build();
  }

  @Post('problem/:site/:key')
  @HttpCode(HttpStatus.OK)
  async getProblemWithCookie(
    @Param('site') site: string,
    @Param('key') key: string,
    @Body() cookies: RequestCralwerCookieDto[],
  ) {
    console.log('방가');
    console.log(cookies);
    const problem = await this.problemCrawlerService.getProblem(
      site,
      key,
      cookies,
    );
    return ResponseDto.Builder.setStatusCode(HttpStatus.OK)
      .setErrorCode('0000')
      .setErrorMessage('정상')
      .setData(problem)
      .build();
  }

  @Get('problem/:site/:key')
  @HttpCode(HttpStatus.OK)
  async getProblem(@Param('site') site: string, @Param('key') key: string) {
    const problem = await this.problemCrawlerService.getProblem(site, key);

    return ResponseDto.Builder.setStatusCode(HttpStatus.OK)
      .setErrorCode('0000')
      .setErrorMessage('정상')
      .setData(problem)
      .build();
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AcmicpcService } from '../problem-crawler/acmicpc.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly acimpcService: AcmicpcService,
  ) {}

  @Get()
  async getHello() {
    console.log('dd');
    await this.acimpcService.getProblem('1000');
    return this.appService.getHello();
  }
}

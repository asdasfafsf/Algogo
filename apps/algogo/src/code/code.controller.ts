import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { CodeService } from './code.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/v1/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get('/setting')
  async getCodeSetting() {
    return '';
  }

  @Put('/setting')
  async updateCodeSetting() {
    return '';
  }

  @Get('/template')
  async getTemplate() {
    return '';
  }

  @Put('/template/default')
  async setDefaultTemplate() {
    return;
  }

  @Post('/template')
  async createTemplate() {
    return '';
  }

  @Delete('/template/:uuid')
  async deleteTemplate() {
    return '';
  }

  @Get('/problem')
  async getProblemCode() {
    return '';
  }

  @Put('/problem')
  async updateProblemCode() {
    return '';
  }
}

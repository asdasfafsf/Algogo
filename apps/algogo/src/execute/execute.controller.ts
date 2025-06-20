import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from './dto/RequestExecuteDto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CustomLogger } from '../logger/custom-logger';
import { AuthGuard } from '../auth-guard/auth.guard';

@Controller('api/v1/execute')
export class ExecuteController {
  constructor(
    private readonly logger: CustomLogger,
    private readonly executeService: ExecuteService,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiExcludeEndpoint()
  async execute(@Body() requestExecuteDto: RequestExecuteDto) {
    this.logger.silly('execute', requestExecuteDto);
    return {};
  }
}

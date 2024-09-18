import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CustomLogger } from '../logger/custom-logger';

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
    this.logger.silly('api/v1/execute', {
      data: requestExecuteDto,
    });
    return this.executeService.execute(requestExecuteDto);
  }
}

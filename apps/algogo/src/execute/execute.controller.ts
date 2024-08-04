import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { RequestExecuteDto } from '@libs/core/dto/RequestExecuteDto';
import { Logger } from 'winston';

@Controller('api/v1/execute')
export class ExecuteController {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
    private readonly executeService: ExecuteService,
  ) {}

  @Post('/')
  async execute(@Body() requestExecuteDto: RequestExecuteDto) {
    this.logger.silly('api/v1/execute', {
      data: requestExecuteDto,
    });
    return this.executeService.execute(requestExecuteDto);
  }
}

import { Controller } from '@nestjs/common';
import { ExecuteService } from './execute.service';

@Controller('execute')
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}
}

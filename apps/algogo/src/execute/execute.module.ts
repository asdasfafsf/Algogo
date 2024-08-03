import { Module } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteController } from './execute.controller';
import { ExecuteBrokerService } from './execute-broker.service';

@Module({
  controllers: [ExecuteController],
  providers: [ExecuteService, ExecuteBrokerService],
})
export class ExecuteModule {}

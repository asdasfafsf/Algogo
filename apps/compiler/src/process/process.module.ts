import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessManagementService } from './process-management.service';

@Module({
  providers: [ProcessService, ProcessManagementService],
  exports: [ProcessService],
})
export class ProcessModule {}

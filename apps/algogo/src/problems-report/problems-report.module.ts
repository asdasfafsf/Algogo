import { Module } from '@nestjs/common';
import { ProblemsReportService } from './problems-report.service';
import { ProblemsReportController } from './problems-report.controller';

@Module({
  controllers: [ProblemsReportController],
  providers: [ProblemsReportService],
})
export class ProblemsReportModule {}

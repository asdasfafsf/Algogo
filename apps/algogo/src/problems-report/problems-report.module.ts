import { Module } from '@nestjs/common';
import { ProblemsReportService } from './problems-report.service';
import { ProblemsReportController } from './problems-report.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProblemsReportController],
  providers: [ProblemsReportService],
  imports: [AuthModule],
})
export class ProblemsReportModule {}

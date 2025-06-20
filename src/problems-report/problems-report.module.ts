import { Module } from '@nestjs/common';
import { ProblemsReportService } from './problems-report.service';
import { ProblemsReportController } from './problems-report.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProblemsReportRepository } from './problems-report.repository';
import { AuthGuardModule } from '../auth-guard/auth-guard.module';

@Module({
  controllers: [ProblemsReportController],
  providers: [ProblemsReportService, ProblemsReportRepository],
  imports: [AuthGuardModule, PrismaModule],
})
export class ProblemsReportModule {}

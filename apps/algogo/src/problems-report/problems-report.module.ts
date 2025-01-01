import { Module } from '@nestjs/common';
import { ProblemsReportService } from './problems-report.service';
import { ProblemsReportController } from './problems-report.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProblemsReportRepository } from './problems-report.repository';

@Module({
  controllers: [ProblemsReportController],
  providers: [ProblemsReportService, ProblemsReportRepository],
  imports: [AuthModule, PrismaModule],
})
export class ProblemsReportModule {}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import ProblemReportDto from './dto/ProblemReportDto';

@Injectable()
export class ProblemsReportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProblemNo(problemUuid: string) {
    return await this.prismaService.problem.findUnique({
      select: {
        no: true,
      },
      where: {
        uuid: problemUuid,
      },
    });
  }

  async insertProblemsReport(
    problemReportDto: ProblemReportDto & { problemNo: number },
  ) {
    const { problemNo, title, content, userNo } = problemReportDto;

    await this.prismaService.problemReport.create({
      select: {
        problemNo: true,
      },
      data: {
        problemNo,
        userNo,
        title,
        content,
        state: 'PENDING',
      },
    });
  }
}

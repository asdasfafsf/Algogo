import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class ProblemsCollectRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProblem(
    { source, sourceId }: { source: string; sourceId: string },
    tx?: Prisma.TransactionClient,
  ) {
    const problem = await (tx ?? this.prismaService).problem.findUnique({
      select: {
        updatedAt: true,
      },
      where: {
        source_sourceId: {
          source,
          sourceId,
        },
      },
    });

    return problem;
  }

  async insertCollectionLog(
    log: { userNo: number; url: string; state: string; cause?: string },
    tx?: Prisma.TransactionClient,
  ) {
    const { userNo, url, state, cause } = log;
    await (tx ?? this.prismaService).problemCollectionLog.create({
      select: {
        state: true,
      },
      data: {
        userNo,
        url,
        state,
        cause,
      },
    });
  }
}

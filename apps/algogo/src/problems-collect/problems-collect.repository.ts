import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseProblemDto } from '@libs/core/dto/ResponseProblemDto';
import { Prisma } from '@prisma/client';
@Injectable()
export class ProblemsCollectRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertProblem(data: ResponseProblemDto, tx?: Prisma.TransactionClient) {
    try {
      return await (tx ?? this.prismaService).problem.upsert({
        where: {
          source_sourceId: {
            sourceId: data.sourceId,
            source: data.source,
          },
        },
        update: {
          title: data.title,
          level: data.level,
          levelText: data.levelText,
          updatedDate: new Date(),
          updatedAt: new Date(),
          input: data.input,
          output: data.output,
          limit: data.limit,
          answerCount: data.answerCount,
          answerRate: data.answerRate,
          answerPeopleCount: data.answerPeopleCount,
          submitCount: data.submitCount,
          timeout: data.timeout,
          memoryLimit: data.memoryLimit,
          source: data.source,
          sourceId: data.sourceId,
          sourceUrl: data.sourceUrl,
          contentList: {
            deleteMany: {},
            create: data.contentList.map((content) => ({
              order: content.order,
              type: content.type,
              content: content.content,
              cellList: {
                create: content.cellList.map((cell) => ({
                  content: cell.content,
                  rowIndex: cell.rowIndex,
                  colIndex: cell.colIndex,
                  isHeader: cell.isHeader,
                })),
              },
            })),
          },
          typeList: {
            deleteMany: {},
            create: data.typeList.map((name) => ({ name })),
          },
          inputOutputList: {
            deleteMany: {},
            create: data.inputOutputList,
          },
        },
        create: {
          title: data.title,
          level: data.level,
          levelText: data.levelText,
          updatedDate: new Date(),
          updatedAt: new Date(),
          input: data.input,
          output: data.output,
          limit: data.limit,
          answerCount: data.answerCount,
          answerRate: data.answerRate,
          answerPeopleCount: data.answerPeopleCount,
          submitCount: data.submitCount,
          timeout: data.timeout,
          memoryLimit: data.memoryLimit,
          source: data.source,
          sourceId: data.sourceId,
          sourceUrl: data.sourceUrl,
          contentList: {
            create: data.contentList.map((content) => ({
              order: content.order,
              type: content.type,
              content: content.content,
              cellList: {
                create: content.cellList.map((cell) => ({
                  content: cell.content,
                  rowIndex: cell.rowIndex,
                  colIndex: cell.colIndex,
                  isHeader: cell.isHeader,
                })),
              },
            })),
          },
          typeList: {
            create: data.typeList.map((name) => ({ name })),
          },
          inputOutputList: {
            create: data.inputOutputList,
          },
        },
      });
    } catch (e) {
      console.log('야야야');
      console.log(e);

      throw new Error('야야야');
    }
  }

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

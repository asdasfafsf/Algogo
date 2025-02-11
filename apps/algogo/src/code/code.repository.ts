import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCodeSetting(userNo: number) {
    const codeSetting = await this.prisma.codeSetting.findUnique({
      select: {
        fontSize: true,
        problemContentRate: true,
        theme: true,
        tabSize: true,
        lineNumber: true,
        defaultLanguage: true,
      },
      where: { userNo },
    });

    return codeSetting;
  }

  async upsertCodeSetting({
    userNo,
    fontSize,
    problemContentRate,
    theme,
    tabSize,
    lineNumber,
    defaultLanguage,
  }: {
    userNo: number;
    fontSize?: number;
    problemContentRate?: number;
    theme?: string;
    tabSize?: number;
    lineNumber?: string;
    defaultLanguage?: string;
  }) {
    await this.prisma.codeSetting.upsert({
      where: { userNo },
      update: {
        fontSize,
        problemContentRate,
        theme,
        tabSize,
        lineNumber,
        defaultLanguage,
        updatedAt: new Date(),
      },
      create: {
        userNo,
        fontSize,
        problemContentRate,
        theme,
        tabSize,
        lineNumber,
        defaultLanguage,
      },
    });
  }
}

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

  async getCodeTemplate(userNo: number) {
    const [defaultList, templateList] = await Promise.all([
      this.prisma.codeDefaultTemplate
        .findMany({
          where: { userNo },
          select: {
            codeTemplateNo: true,
          },
        })
        .then((defaults) =>
          this.prisma.codeTemplate.findMany({
            where: {
              no: {
                in: defaults.map((d) => d.codeTemplateNo),
              },
            },
            select: {
              language: true,
              uuid: true,
              name: true,
              content: true,
              description: true,
            },
          }),
        ),

      // 전체 템플릿 목록
      this.prisma.codeTemplate.findMany({
        where: { userNo },
        select: {
          uuid: true,
          name: true,
          language: true,
        },
      }),
    ]);

    return {
      defaultList,
      templateList,
    };
  }

  async getCodeTemplateList(userNo: number) {
    const codeTemplateList = await this.prisma.codeTemplate.findMany({
      select: {
        uuid: true,
        name: true,
        language: true,
      },
      where: { userNo },
    });

    return codeTemplateList;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LanguageProvider } from '../common/enums/LanguageProviderEnum';

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

  async getCodeTemplateResult(userNo: number) {
    const [defaultList, summaryList] = await Promise.all([
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
              createdAt: true,
              updatedAt: true,
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
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      defaultList,
      summaryList,
    };
  }

  async getCodeTemplateNo({ uuid, userNo }: { uuid: string; userNo: number }) {
    const codeTemplate = await this.prisma.codeTemplate.findUnique({
      select: {
        no: true,
      },
      where: {
        userNo,
        uuid,
      },
    });

    return codeTemplate?.no;
  }

  async getCodeTemplate({
    userNo,
    codeTemplateNo,
  }: {
    userNo: number;
    codeTemplateNo: number;
  }) {
    const codeTemplate = await this.prisma.codeTemplate.findUnique({
      select: {
        uuid: true,
        name: true,
        language: true,
        content: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        userNo,
        no: codeTemplateNo,
      },
    });

    return codeTemplate;
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

  async upsertCodeDefaultTemplate({ userNo, language, codeTemplateNo }) {
    await this.prisma.codeDefaultTemplate.upsert({
      update: {
        codeTemplateNo,
      },
      create: {
        userNo,
        language,
        codeTemplateNo,
      },
      where: {
        userNo_language: {
          userNo,
          language,
        },
      },
    });
  }

  async selectTotalCodeTemplateCount(userNo: number) {
    return await this.prisma.codeTemplate.count({
      where: {
        userNo,
      },
    });
  }

  async createCodeTemplate({
    userNo,
    content,
    language,
    description,
    name,
  }: {
    userNo: number;
    content: string;
    description: string;
    name: string;
    language: LanguageProvider;
  }) {
    const codeTemplate = await this.prisma.codeTemplate.create({
      select: {
        uuid: true,
        name: true,
        content: true,
        language: true,
        description: true,
      },
      data: {
        userNo,
        content,
        language,
        description,
        name,
      },
    });

    return codeTemplate;
  }

  async updateCodeTempltae({
    userNo,
    content,
    language,
    description,
    name,
    no,
  }: {
    userNo: number;
    content?: string;
    description?: string;
    name?: string;
    language: LanguageProvider;
    no: number;
  }) {
    const codeTemplate = await this.prisma.codeTemplate.update({
      select: {
        uuid: true,
        name: true,
        content: true,
        language: true,
        description: true,
      },
      data: {
        description,
        userNo,
        content,
        language,
        name,
      },
      where: {
        no,
        userNo,
      },
    });

    return codeTemplate;
  }

  async deleteCodeTemplate({ no }: { no: number }) {
    return await this.prisma.codeTemplate.delete({
      select: {
        uuid: true,
      },
      where: {
        no,
      },
    });
  }

  async problemUuidToProblemNo(uuid: string) {
    return await this.prisma.problem.findUnique({
      select: {
        no: true,
      },
      where: {
        uuid,
      },
    });
  }

  async getProblemCode({
    userNo,
    problemNo,
    language,
  }: {
    userNo: number;
    problemNo: number;
    language: LanguageProvider;
  }) {
    const problemCode = await this.prisma.problemCode.findFirst({
      select: {
        content: true,
        updatedAt: true,
        createdAt: true,
      },
      where: {
        userNo,
        problemNo,
        language,
      },
    });

    return problemCode;
  }

  async upsertProblemCode({
    userNo,
    problemNo,
    language,
    content,
  }: {
    userNo: number;
    problemNo: number;
    language: LanguageProvider;
    content: string;
  }) {
    await this.prisma.problemCode.upsert({
      where: {
        userNo,
      },
      update: {
        content,
        problemNo,
        language,
      },
      create: {
        userNo,
        problemNo,
        language,
        content,
      },
    });
  }
}

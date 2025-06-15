import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LanguageProvider } from '../common/enums/LanguageProviderEnum';

@Injectable()
export class CodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCodeSetting(userUuid: string) {
    const codeSetting = await this.prisma.codeSetting.findUnique({
      select: {
        fontSize: true,
        problemContentRate: true,
        theme: true,
        tabSize: true,
        lineNumber: true,
        defaultLanguage: true,
      },
      where: { userUuid },
    });

    return codeSetting;
  }

  async upsertCodeSetting({
    userUuid,
    fontSize,
    problemContentRate,
    theme,
    tabSize,
    lineNumber,
    defaultLanguage,
  }: {
    userUuid: string;
    fontSize?: number;
    problemContentRate?: number;
    theme?: string;
    tabSize?: number;
    lineNumber?: string;
    defaultLanguage?: string;
  }) {
    await this.prisma.codeSetting.upsert({
      where: { userUuid },
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
        userUuid,
        fontSize,
        problemContentRate,
        theme,
        tabSize,
        lineNumber,
        defaultLanguage,
      },
    });
  }

  async getCodeTemplateResult(userUuid: string) {
    const [defaultList, summaryList] = await Promise.all([
      this.prisma.codeDefaultTemplate
        .findMany({
          where: { userUuid },
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
        where: { userUuid },
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

  async getCodeTemplateNo({
    uuid,
    userUuid,
  }: {
    uuid: string;
    userUuid: string;
  }) {
    const codeTemplate = await this.prisma.codeTemplate.findUnique({
      select: {
        no: true,
      },
      where: {
        userUuid,
        uuid,
      },
    });

    return codeTemplate?.no;
  }

  async getCodeTemplate({
    uuid,
    userUuid,
  }: {
    uuid: string;
    userUuid: string;
  }) {
    const codeTemplates = await this.prisma.codeTemplate.findFirst({
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
        uuid,
        userUuid,
      },
    });

    return codeTemplates;
  }

  async getCodeTemplateList(userUuid: string) {
    const codeTemplateList = await this.prisma.codeTemplate.findMany({
      select: {
        uuid: true,
        name: true,
        language: true,
      },
      where: { userUuid },
    });

    return codeTemplateList;
  }

  async upsertCodeDefaultTemplate({ userUuid, language, codeTemplateNo }) {
    await this.prisma.codeDefaultTemplate.upsert({
      update: {
        codeTemplateNo,
      },
      create: {
        userUuid,
        language,
        codeTemplateNo,
      },
      where: {
        userUuid_language: {
          userUuid,
          language,
        },
      },
    });
  }

  async selectTotalCodeTemplateCount(userUuid: string) {
    return await this.prisma.codeTemplate.count({
      where: {
        userUuid,
      },
    });
  }

  async createCodeTemplate({
    userUuid,
    content,
    language,
    description,
    name,
  }: {
    userUuid: string;
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
        userUuid,
        content,
        language,
        description,
        name,
      },
    });

    return codeTemplate;
  }

  async updateCodeTempltae({
    userUuid,
    content,
    language,
    description,
    name,
    no,
  }: {
    userUuid: string;
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
        userUuid,
        content,
        language,
        name,
      },
      where: {
        no,
        userUuid,
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

  async getProblemCodes({
    userNo,
    problemUuid,
  }: {
    userNo: number;
    problemUuid: string;
  }) {
    const problemCode = await this.prisma.problemCode.findMany({
      select: {
        language: true,
        content: true,
        updatedAt: true,
        createdAt: true,
      },
      where: {
        userNo,
        problemUuid,
      },
    });

    return problemCode;
  }

  async upsertProblemCode({
    userNo,
    problemUuid,
    language,
    content,
  }: {
    userNo: number;
    problemUuid: string;
    language: LanguageProvider;
    content: string;
  }) {
    await this.prisma.problemCode.upsert({
      where: {
        userNo_problemUuid_language: {
          userNo,
          problemUuid,
          language,
        },
      },
      update: {
        content,
        problemUuid,
        language,
        updatedAt: new Date(),
      },
      create: {
        userNo,
        problemUuid,
        language,
        content,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import RequestUpsertCodeSettingDto from './dto/RequestUpsertCodeSettingDto';
import { NotFoundCodeSettingException } from './errors/NotFoundCodeSettingException';
import { NotFoundCodeTemplateException } from './errors/NotFoundCodeTemplateException';
import { ResponseCodeTemplateResult } from './dto/ResponseCodeTemplateResult';
import { LanguageProvider } from '../common/enums/LanguageProviderEnum';
import RequestUpsertDefaultCodeTemplateDto from './dto/RequestUpsertDefaultCodeTemplateDto';
import { CodeTemplateLimitExceededException } from './errors/CodeTemplateLimitExceededException';
import RequestUpsertCodeTemplateDto from './dto/RequestUpdateCodeTemplateDto';
import RequestCreateCodeTemplateDto from './dto/RequestCreateCodeTemplateDto';
import { NotFoundProblemException } from './errors/NotFoundProblemException';
import { NotFoundProblemCode } from './errors/NotFoundProblemCode';
@Injectable()
export class CodeService {
  constructor(private readonly codeRepository: CodeRepository) {}

  async getCodeSetting(userNo: number) {
    const codeSetting = await this.codeRepository.getCodeSetting(userNo);

    if (!codeSetting) {
      throw new NotFoundCodeSettingException();
    }

    return codeSetting;
  }

  async upsertCodeSetting(
    dto: RequestUpsertCodeSettingDto & { userNo: number },
  ) {
    return this.codeRepository.upsertCodeSetting(dto);
  }

  async getCodeTemplateResult(
    userNo: number,
  ): Promise<ResponseCodeTemplateResult> {
    const { summaryList, defaultList } =
      await this.codeRepository.getCodeTemplateResult(userNo);

    return {
      summaryList: summaryList.map((elem) => ({
        ...elem,
        language: elem.language as LanguageProvider,
      })),
      defaultList: defaultList.map((elem) => ({
        ...elem,
        language: elem.language as LanguageProvider,
      })),
    };
  }

  async getCodeTemplate({ userNo, uuid }: { userNo: number; uuid: string }) {
    const codeTemplateNo = await this.codeRepository.getCodeTemplateNo({
      userNo,
      uuid,
    });
    if (!codeTemplateNo) {
      throw new NotFoundCodeTemplateException();
    }
    const codeTemplate = this.codeRepository.getCodeTemplate({
      userNo,
      codeTemplateNo,
    });

    return codeTemplate;
  }

  async createCodeTemplate(
    dto: RequestCreateCodeTemplateDto & { userNo: number },
  ) {
    const { userNo, content, description, name, language } = dto;
    const count =
      await this.codeRepository.selectTotalCodeTemplateCount(userNo);

    if (count >= 10) {
      throw new CodeTemplateLimitExceededException();
    }

    return await this.codeRepository.createCodeTemplate({
      userNo,
      content,
      description,
      name,
      language,
    });
  }

  async updateCodeTemplate(
    dto: RequestUpsertCodeTemplateDto & { userNo: number },
  ) {
    const { userNo, uuid, content, description, name, language } = dto;
    const no = await this.codeRepository.getCodeTemplateNo({ uuid, userNo });

    if (!no) {
      throw new NotFoundCodeTemplateException();
    }

    return await this.codeRepository.updateCodeTempltae({
      userNo,
      content,
      description,
      name,
      language,
      no,
    });
  }

  async deleteCodeTemplate({ uuid, userNo }: { uuid: string; userNo: number }) {
    const no = await this.codeRepository.getCodeTemplateNo({ uuid, userNo });

    if (!no) {
      throw new NotFoundCodeTemplateException();
    }

    return await this.codeRepository.deleteCodeTemplate({ no });
  }

  async setDefaultCodeTemplate(
    dto: RequestUpsertDefaultCodeTemplateDto & { userNo: number },
  ) {
    const { userNo, uuid, language } = dto;
    const codeTemplateNo = await this.codeRepository.getCodeTemplateNo({
      uuid,
      userNo,
    });

    if (!codeTemplateNo) {
      throw new NotFoundCodeTemplateException();
    }

    return this.codeRepository.upsertCodeDefaultTemplate({
      userNo,
      language,
      codeTemplateNo,
    });
  }

  async getProblemCode({
    userNo,
    problemUuid,
    language,
  }: {
    userNo: number;
    problemUuid: string;
    language: LanguageProvider;
  }) {
    const problem =
      await this.codeRepository.problemUuidToProblemNo(problemUuid);

    if (!problem) {
      throw new NotFoundProblemException();
    }

    const problemNo = problem.no;
    const problemCode = await this.codeRepository.getProblemCode({
      userNo,
      problemNo,
      language,
    });

    if (!problemCode) {
      throw new NotFoundProblemCode();
    }

    return problemCode;
  }
}

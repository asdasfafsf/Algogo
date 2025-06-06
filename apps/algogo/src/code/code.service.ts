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
import { RedisService } from '../redis/redis.service';
import RequestUpsertProblemCodeDto from './dto/RequestUpsertProblemCodeDto';
import { CustomLogger } from '../logger/custom-logger';
@Injectable()
export class CodeService {
  constructor(
    private readonly redisService: RedisService,
    private readonly codeRepository: CodeRepository,
    private readonly logger: CustomLogger,
  ) {}

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
    const { userNo, content, description, name, language, isDefault } = dto;
    const count =
      await this.codeRepository.selectTotalCodeTemplateCount(userNo);

    if (count >= 10) {
      throw new CodeTemplateLimitExceededException();
    }

    const codeTemplate = await this.codeRepository.createCodeTemplate({
      userNo,
      content,
      description,
      name,
      language,
    });

    if (isDefault) {
      await this.setDefaultCodeTemplate({
        userNo,
        uuid: codeTemplate.uuid,
        language,
      });
    }

    return codeTemplate;
  }

  async updateCodeTemplate(
    dto: RequestUpsertCodeTemplateDto & { userNo: number },
  ) {
    const { userNo, uuid, content, description, name, language, isDefault } =
      dto;
    const no = await this.codeRepository.getCodeTemplateNo({ uuid, userNo });

    if (!no) {
      throw new NotFoundCodeTemplateException();
    }

    const codeTemplate = await this.codeRepository.updateCodeTempltae({
      userNo,
      content,
      description,
      name,
      language,
      no,
    });

    if (isDefault) {
      await this.setDefaultCodeTemplate({
        userNo,
        uuid: codeTemplate.uuid,
        language,
      });
    }

    return codeTemplate;
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

  async problemUuidToProblemNo(problemUuid: string) {
    let problemNo = await this.redisService.get(`problemUuid_${problemUuid}`);

    if (!problemNo) {
      const problem =
        await this.codeRepository.problemUuidToProblemNo(problemUuid);

      if (!problem) {
        throw new NotFoundProblemException();
      }

      problemNo = problem.no.toString();
      await this.redisService.set(`problemUuid_${problemUuid}`, problemNo);
    }

    return Number(problemNo);
  }

  async getProblemCodes({
    userNo,
    problemUuid,
  }: {
    userNo: number;
    problemUuid: string;
  }) {
    const problemCodes = await this.codeRepository.getProblemCodes({
      userNo,
      problemUuid,
    });

    if (!problemCodes) {
      throw new NotFoundProblemCode();
    }

    return problemCodes;
  }

  async upsertProblemCode(
    dto: RequestUpsertProblemCodeDto & { userNo: number },
  ) {
    const { problemUuid, language, content, userNo } = dto;
    return await this.codeRepository.upsertProblemCode({
      userNo,
      problemUuid,
      language,
      content,
    });
  }
}

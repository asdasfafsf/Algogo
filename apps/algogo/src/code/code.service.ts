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

  async getCodeSetting(userUuid: string) {
    const codeSetting = await this.codeRepository.getCodeSetting(userUuid);

    if (!codeSetting) {
      throw new NotFoundCodeSettingException();
    }

    return codeSetting;
  }

  async upsertCodeSetting(
    dto: RequestUpsertCodeSettingDto & { userUuid: string },
  ) {
    return this.codeRepository.upsertCodeSetting(dto);
  }

  async getCodeTemplateResult(
    userUuid: string,
  ): Promise<ResponseCodeTemplateResult> {
    const { summaryList, defaultList } =
      await this.codeRepository.getCodeTemplateResult(userUuid);

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

  async getCodeTemplate({
    userUuid,
    uuid,
  }: {
    userUuid: string;
    uuid: string;
  }) {
    const codeTemplate = this.codeRepository.getCodeTemplate({
      userUuid,
      uuid,
    });

    if (!codeTemplate) {
      throw new NotFoundCodeTemplateException();
    }

    return codeTemplate;
  }

  async createCodeTemplate(
    dto: RequestCreateCodeTemplateDto & { userUuid: string },
  ) {
    const { userUuid, content, description, name, language, isDefault } = dto;
    const count =
      await this.codeRepository.selectTotalCodeTemplateCount(userUuid);

    if (count >= 10) {
      throw new CodeTemplateLimitExceededException();
    }

    const codeTemplate = await this.codeRepository.createCodeTemplate({
      userUuid,
      content,
      description,
      name,
      language,
    });

    if (isDefault) {
      await this.setDefaultCodeTemplate({
        userUuid,
        uuid: codeTemplate.uuid,
        language,
      });
    }

    return codeTemplate;
  }

  async updateCodeTemplate(
    dto: RequestUpsertCodeTemplateDto & { userUuid: string },
  ) {
    const { userUuid, uuid, content, description, name, language, isDefault } =
      dto;
    const no = await this.codeRepository.getCodeTemplateNo({ uuid, userUuid });

    if (!no) {
      throw new NotFoundCodeTemplateException();
    }

    const codeTemplate = await this.codeRepository.updateCodeTempltae({
      userUuid,
      content,
      description,
      name,
      language,
      no,
    });

    if (isDefault) {
      await this.setDefaultCodeTemplate({
        userUuid,
        uuid: codeTemplate.uuid,
        language,
      });
    }

    return codeTemplate;
  }

  async deleteCodeTemplate({
    uuid,
    userUuid,
  }: {
    uuid: string;
    userUuid: string;
  }) {
    const no = await this.codeRepository.getCodeTemplateNo({ uuid, userUuid });

    if (!no) {
      throw new NotFoundCodeTemplateException();
    }

    return await this.codeRepository.deleteCodeTemplate({ no });
  }

  async setDefaultCodeTemplate(
    dto: RequestUpsertDefaultCodeTemplateDto & { userUuid: string },
  ) {
    const { userUuid, uuid, language } = dto;
    const codeTemplateNo = await this.codeRepository.getCodeTemplateNo({
      uuid,
      userUuid,
    });

    if (!codeTemplateNo) {
      throw new NotFoundCodeTemplateException();
    }

    return this.codeRepository.upsertCodeDefaultTemplate({
      userUuid,
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

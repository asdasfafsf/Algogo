import { Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import RequestUpsertCodeSettingDto from './dto/RequestUpsertCodeSettingDto';
import { NotFoundCodeSettingException } from './errors/NotFoundCodeSettingException';
import { NotFoundCodeTemplateException } from './errors/NotFoundCodeTemplateException';
import { ResponseCodeTemplateResult } from './dto/ResponseCodeTemplateResult';
import { LanguageProvider } from '../common/enums/LanguageProviderEnum';
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
    const codeTemplate = this.codeRepository.getCodeTemplate({ userNo, uuid });

    if (!codeTemplate) {
      throw new NotFoundCodeTemplateException();
    }

    return codeTemplate;
  }
}

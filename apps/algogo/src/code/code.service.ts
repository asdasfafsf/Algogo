import { Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import RequestUpsertCodeSettingDto from './dto/RequestUpsertCodeSettingDto';
import { NotFoundCodeSettingException } from './errors/NotFoundCodeSettingException';
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

  async getCodeTemplate(userNo: number) {
    return this.codeRepository.getCodeTemplate(userNo);
  }
}

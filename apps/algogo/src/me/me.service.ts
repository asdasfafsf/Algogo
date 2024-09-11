import { Injectable } from '@nestjs/common';
import { MeRepository } from './me.repository';
import { ResponseMeDto } from './dto/ResponseMeDto';
import { ResponseSocialDto } from './dto/ResponseSocialDto';
import { S3Service } from '../s3/s3.service';
import { uuidv7 } from 'uuidv7';
import { CryptoService } from '../crypto/crypto.service';
import { ImageService } from '../image/image.service';
import { UpdateMeDto } from './dto/UpdateMeDto';
import { SocialProvider } from '../common/enums/SocialProviderEnum';

@Injectable()
export class MeService {
  constructor(
    private readonly meRepository: MeRepository,
    private readonly s3Service: S3Service,
    private readonly cryptoService: CryptoService,
    private readonly imageService: ImageService,
  ) {}

  async getMe(userNo: number): Promise<ResponseMeDto> {
    const me = await this.meRepository.getMe(userNo);
    const socialList = me.socialList.map((elem) => ({
      provider: elem.provider as SocialProvider,
      content: elem.content,
    })) as ResponseSocialDto[];

    const responseMeDto = {
      ...me,
      socialList,
    };

    return responseMeDto;
  }

  async updateMe(updateMeDto: UpdateMeDto): Promise<ResponseMeDto> {
    const { file } = updateMeDto;
    if (file) {
      const webp = await this.imageService.toWebp(file.buffer);
      const { userNo } = updateMeDto;
      const path = `${await this.toPath(userNo)}.webp`;
      const fullPath = await this.s3Service.upload(path, webp);
      updateMeDto.profilePhoto = fullPath;
    }

    const me = await this.meRepository.updateMe(updateMeDto);

    return {
      ...me,
      socialList: me.socialList.map(({ provider, content }) => ({
        provider: provider as SocialProvider,
        content,
      })),
    };
  }

  private async toPath(userNo: number) {
    const uuid = await this.meRepository.getUuid(userNo);
    const fileName = await this.cryptoService.SHA256(uuidv7());
    return `${uuid}/${fileName}`;
  }
}

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
import { OAuthProvider } from '../common/enums/OAuthProviderEnum';
import { CustomLogger } from '../logger/custom-logger';

@Injectable()
export class MeService {
  constructor(
    private readonly meRepository: MeRepository,
    private readonly s3Service: S3Service,
    private readonly cryptoService: CryptoService,
    private readonly imageService: ImageService,
    private readonly logger: CustomLogger,
  ) {}

  async getMe(userNo: number): Promise<ResponseMeDto> {
    const me = await this.meRepository.getMe(userNo);
    const socialList = me.socialList.map((elem) => ({
      provider: elem.provider as SocialProvider,
      content: elem.content,
    })) as ResponseSocialDto[];
    const oauthList = me.oauthList.map(({ provider }) => ({
      provider: provider as OAuthProvider,
    }));
    const responseMeDto = {
      ...me,
      socialList,
      oauthList,
    };

    return responseMeDto;
  }

  async updateMe(updateMeDto: UpdateMeDto): Promise<ResponseMeDto> {
    const { file } = updateMeDto;
    if (file) {
      const webp = await this.imageService.toWebp(file.buffer);
      const { userNo } = updateMeDto;
      const path = `${await this.toPath(userNo)}.webp`;

      this.logger.silly('start uploda');
      const fullPath = await this.s3Service.upload(path, webp);
      
      this.logger.silly('end');
      updateMeDto.profilePhoto = fullPath;
    }

    const me = await this.meRepository.updateMe(updateMeDto);

    if (file) {
      this.logger.silly('remove file start', me)
      await this.s3Service.removeObject(me.profilePhoto);
    }

    return {
      ...me,
      socialList: me.socialList.map(({ provider, content }) => ({
        provider: provider as SocialProvider,
        content,
      })),
      oauthList: me.oauthList.map(({ provider }) => ({
        provider: provider as OAuthProvider,
      })),
    };
  }

  private async toPath(userNo: number) {
    const uuid = await this.meRepository.getUuid(userNo);
    const fileName = await this.cryptoService.SHA256(uuidv7());
    return `${uuid}/${fileName}`;
  }
}

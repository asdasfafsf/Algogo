import { IsIn, IsString } from 'class-validator';
import { SocialProvider } from '../../common/enums/SocialProviderEnum';

export class RequestUpdateSocialDto {
  @IsIn(Object.values(SocialProvider), {
    message: '소셜 타입이 잘못되었습니다.',
  })
  provider: SocialProvider;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  content: string;
}

import { IsIn, IsString } from 'class-validator';
import { SocialProvider } from '../../common/types/social.type';
import { SOCIAL_PROVIDER } from 'src/common/constants/social.constant';

export class RequestUpdateSocialDto {
  @IsIn(Object.values(SOCIAL_PROVIDER), {
    message: '소셜 타입이 잘못되었습니다.',
  })
  provider: SocialProvider;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  content: string;
}

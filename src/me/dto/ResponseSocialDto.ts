import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from '../../common/types/social.type';
import { SOCIAL_PROVIDER } from 'src/common/constants/social.constant';

export class ResponseSocialDto {
  @ApiProperty({ enum: SOCIAL_PROVIDER, description: '소셜 미디어 제공자' })
  provider: SocialProvider;

  @ApiProperty({
    description: '링크',
    example: 'https://test.co.kr',
  })
  content: string;
}

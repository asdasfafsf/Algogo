import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from '../../common/enums/SocialProviderEnum';

export class ResponseSocialDto {
  @ApiProperty({ enum: SocialProvider, description: '소셜 미디어 제공자' })
  provider: SocialProvider;

  @ApiProperty({
    description: '링크',
    example: 'https://test.co.kr',
  })
  content: string;
}

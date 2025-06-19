import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from '../../common/types/oauth.type';
import { OAUTH_PROVIDER } from '../../common/constants/oauth.contant';

export class ResponseOAuthDto {
  @ApiProperty({
    description: 'OAuth기관',
    enum: OAUTH_PROVIDER,
  })
  provider: OAuthProvider;
}

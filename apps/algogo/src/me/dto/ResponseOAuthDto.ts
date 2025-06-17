import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from '../../oauth-v2/types/oauth.type';
import { OAUTH_PROVIDER } from '../../oauth-v2/constants/oauth.contant';

export class ResponseOAuthDto {
  @ApiProperty({
    description: 'OAuth기관',
    enum: OAUTH_PROVIDER,
  })
  provider: OAuthProvider;
}

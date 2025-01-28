import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from '../../common/enums/OAuthProviderEnum';

export class RequestOAuthDisconnectDto {
  @ApiProperty({
    description: 'OAuth 제공자',
    enum: OAuthProvider,
    example: OAuthProvider.GOOGLE,
  })
  provider: OAuthProvider;
}

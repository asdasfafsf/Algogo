import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from '../../common/enums/OAuthProviderEnum';

export class ResponseOAuthDto {
  @ApiProperty({
    description: 'OAuth기관',
    enum: OAuthProvider,
  })
  provider: OAuthProvider;
}

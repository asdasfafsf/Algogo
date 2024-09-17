import { ApiProperty } from '@nestjs/swagger';

export default class ResponseTokenDto {
  @ApiProperty({
    description: 'access token',
    example: '토큰',
  })
  accessToken: string;
  @ApiProperty({
    description: 'refresh token',
    example: '토큰',
  })
  refreshToken: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { ResponseSocialDto } from './ResponseSocialDto';
import { ResponseOAuthDto } from './ResponseOAuthDto';

export class ResponseMeDto {
  @ApiProperty({
    description: 'The UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Profile photo URL of the user',
    example: 'https://example.com/profile-photo.jpg',
  })
  profilePhoto: string;

  @ApiProperty({
    type: [ResponseSocialDto],
    description: "List of user's social accounts",
  })
  socialList: ResponseSocialDto[];

  @ApiProperty({
    type: [ResponseOAuthDto],
    description: "List of user's social accounts",
  })
  oauthList: ResponseOAuthDto[];
}

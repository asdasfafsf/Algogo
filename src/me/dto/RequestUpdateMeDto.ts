import { ValidateNested, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RequestUpdateSocialDto } from './RequestUpdateSocialDto';

export class RequestUpdateMeDto {
  @ApiPropertyOptional({
    description: '사용자의 이름',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: '사용자의 소셜 미디어 정보 리스트',
    type: [RequestUpdateSocialDto],
    example: [
      {
        provider: 'instagram',
        content: 'https://instagram.com/johndoe',
      },
      {
        provider: 'github',
        content: 'https://github.com/johndoe',
      },
      {
        provider: 'linkedin',
        content: 'https://linkedin.com/in/johndoe',
      },
      {
        provider: 'youtube',
        content: 'https://youtube.com/user/johndoe',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestUpdateSocialDto)
  socialList?: RequestUpdateSocialDto[] = [];
}

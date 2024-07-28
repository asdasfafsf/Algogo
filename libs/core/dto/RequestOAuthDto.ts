import {
  IsString,
  IsOptional,
  IsIn,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class RequestOAuthDto {
  @IsIn(['google', 'github', 'kakao'])
  @IsNotEmpty()
  provider: 'google' | 'github' | 'kakao';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  ip?: string;
}

import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { OAuthProvider } from '../../common/enums/OAuthProviderEnum';

export class RequestOAuthConnectDto {
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;

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

  userNo: number;
  userUuid: string;
  ip?: string;
}

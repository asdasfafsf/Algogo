import { IsString, IsOptional } from 'class-validator';

export class RequestOAuthCallbackDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  scope?: string;

  @IsString()
  @IsOptional()
  authuser?: string;

  @IsString()
  @IsOptional()
  prompt?: string;
}

import { Transform } from 'class-transformer';
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

  @IsOptional()
  @Transform((value) => {
    try {
      const destValue = JSON.parse(value.value);
      return { destination: '', ...destValue };
    } catch (e) {
      return { destination: '' };
    }
  })
  state: { destination: string };
}

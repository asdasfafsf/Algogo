import { IsNotEmpty, IsString } from 'class-validator';

export class RequestWsAuthDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

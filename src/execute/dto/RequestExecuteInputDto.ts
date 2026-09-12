import { IsNumber, IsString } from 'class-validator';

export class RequestExecuteInputDto {
  @IsString()
  input!: string;

  @IsNumber()
  seq!: number;
}

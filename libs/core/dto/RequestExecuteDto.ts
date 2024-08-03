import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RequestExecuteDto {
  @IsEnum(['java', 'java17', 'cpp', 'javascript', 'python', 'c++'])
  @IsNotEmpty()
  provider: 'java' | 'java17' | 'cpp' | 'javascript' | 'python' | 'c++';

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  input: string;
}

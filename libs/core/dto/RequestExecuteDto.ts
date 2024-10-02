import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestExecuteDto {
  @IsString()
  @IsNotEmpty({ message: 'seq 필드는 비워둘 수 없습니다.' })
  seq: string;

  @IsIn(['java', 'java17', 'cpp', 'javascript', 'python', 'c++'], {
    message:
      'provider는 "java", "java17", "cpp", "javascript", "python", "c++" 중 하나여야 합니다.',
  })
  @IsNotEmpty({ message: 'provider 필드는 비워둘 수 없습니다.' })
  provider: string;

  @IsString()
  @IsNotEmpty({ message: 'code 필드는 비워둘 수 없습니다.' })
  code: string;

  @IsOptional()
  @IsString()
  input?: string = '';
}

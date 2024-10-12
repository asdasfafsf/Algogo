import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { RequestExecuteInputDto } from '@libs/core/dto/RequestExecuteInputDto';

export class RequestExecuteDto {
  @IsIn(['java', 'java17', 'cpp', 'javascript', 'python', 'c++'], {
    message:
      'provider는 "java", "java17", "cpp", "javascript", "python", "c++" 중 하나여야 합니다.',
  })
  @IsNotEmpty({ message: 'provider 필드는 비워둘 수 없습니다.' })
  provider: string;

  @IsString()
  @IsNotEmpty({ message: 'code 필드는 비워둘 수 없습니다.' })
  code: string;

  inputList: RequestExecuteInputDto[];
}

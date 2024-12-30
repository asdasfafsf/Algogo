import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export default class RequestProblemReportDto {
  @ApiProperty({
    description: '문제 uuid',
    type: String,
  })
  @IsString({
    message: '문제 고유번호를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '문제 고유번호를 입력해주세요.',
  })
  problemUuid: string;

  @ApiProperty({
    description: '문의 내용',
  })
  @IsString({
    message: '문의 내용을 입력해주세요.',
  })
  @IsNotEmpty({
    message: '문의 내용을 입력해주세요.',
  })
  content: string;
}

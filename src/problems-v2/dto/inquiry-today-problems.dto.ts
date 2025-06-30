import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InquiryTodayProblemsDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  @IsNumber({}, { message: '날짜는 숫자만 입력할 수 있습니다.' })
  @Min(-30, {
    message: '30일 전까지만 조회 가능합니다.',
  })
  @Max(0, {
    message: '과거 날짜만 조회 가능합니다.',
  })
  @ApiProperty({
    description: '현재 기준 며칠 후(+) 또는 며칠 전(-) (UTC 기준)',
    minimum: -30,
    maximum: 0,
    default: 0,
    required: false,
    example: 0,
    type: Number,
  })
  day?: number = 0;
}

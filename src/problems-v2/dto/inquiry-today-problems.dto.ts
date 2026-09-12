import { IsOptional, ValidateBy } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InquiryTodayProblemsDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  @ValidateBy({
    name: 'isValidProblemDay',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= -30 &&
        value <= 0,
      defaultMessage: (args) => {
        const value = args?.value;
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return '날짜는 숫자만 입력할 수 있습니다.';
        }
        if (value < -30) {
          return '30일 전까지만 조회 가능합니다.';
        }
        return '과거 날짜만 조회 가능합니다.';
      },
    },
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

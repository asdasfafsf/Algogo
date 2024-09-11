import { IsNumber, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RequestProblemSummaryListDto {
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsNumber({}, { message: '페이지 번호는 숫자만 입력할 수 있습니다.' })
  @Min(0, {
    message: '페이지 번호는 0페이지보다 커야 합니다.',
  })
  @ApiProperty({
    description: '페이지 번호',
    minimum: 1,
    default: 1,
    type: Number,
  })
  pageNo?: number = 1;

  @IsIn([10, 20, 50], { message: '10, 20 또는 50 단위로만 조회가 가능합니다.' })
  @Transform(({ value }) => (value !== undefined ? Number(value) : 10))
  @ApiProperty({
    description: '페이지 사이즈',
    minimum: 10,
    default: 10,
    type: Number,
  })
  pageSize?: number = 10;

  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : []))
  @ApiProperty({
    description: '해당하는 난이도에 대한 문제를 가져옴',
    default: [],
    type: Number,
    isArray: true,
  })
  levelList?: number[];

  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  @ApiProperty({
    description: '해당하는 문제 유형에 대한 문제를 가져옴',
    default: [],
    isArray: true,
  })
  typeList?: string[];
}

import { IsNumber, IsIn, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProblemType } from 'apps/algogo/src/common/enums/ProblemTypeEnum';

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

  @IsOptional() // levelList가 선택 항목이 되도록 추가
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : []))
  @ApiProperty({
    description: '해당하는 난이도에 대한 문제를 가져옴',
    default: [],
    required: false,
    type: Number,
    isArray: true,
  })
  levelList?: number[];

  @IsOptional() // typeList가 선택 항목이 되도록 추가
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({
    description: '해당하는 문제 유형에 대한 문제를 가져옴',
    default: [],
    required: false,
    isArray: true,
  })
  @IsIn(Object.values(ProblemType), {
    message: '올바른 문제 유형이 아닙니다',
    each: true, // 배열 내 각각의 값에 대해 검사
  })
  typeList?: ProblemType[];
}

import { IsNumber, IsIn, Min, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProblemType } from 'apps/algogo/src/common/enums/ProblemTypeEnum';
import { ProblemSort } from '../enum/ProblemSortEnum';
import { ProblemSearchFilter } from '../enum/ProblemSearchFilterEnum';

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

  @IsOptional()
  @ApiProperty({
    description: '문제 이름으로 검색할 때 필요한 파라미터',
    required: false,
  })
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : []))
  @ApiProperty({
    description: '해당하는 난이도에 대한 문제를 가져옴',
    default: [],
    required: false,
    type: Number,
    isArray: true,
  })
  levelList?: number[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @ApiProperty({
    description: '해당하는 문제 유형에 대한 문제를 가져옴',
    default: [],
    required: false,
    isArray: true,
  })
  @IsIn(Object.values(ProblemType), {
    message: '올바른 문제 유형이 아닙니다',
    each: true,
  })
  typeList?: ProblemType[];

  @IsOptional()
  @ApiProperty({
    description: '문제 이름으로 검색할지 조건으로 검색할지 필터',
    default: 0,
    enum: ProblemSearchFilter,
    required: false,
  })
  filter: ProblemSearchFilter = 0;

  @IsOptional()
  @IsEnum(ProblemSort)
  @ApiProperty({
    description: '문제 정렬',
    default: ProblemSort.DEFAULT,
    enum: ProblemSort,
    enumName: 'ProblemSort',
    required: false,
  })
  sort: ProblemSort = ProblemSort.DEFAULT;
}

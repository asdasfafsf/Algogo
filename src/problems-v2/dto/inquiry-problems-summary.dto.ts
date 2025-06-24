import { IsNumber, IsIn, Min, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProblemType, ProblemSort } from '../types/problem.type';
import { PROBLEM_TYPE_MAP } from '../constants/problems-type';
import { PROBLEM_SORT_MAP } from '../constants/problems-sort';
import { UserProblemState } from '../../common/types/user.type';
import { USER_PROBLEM_STATE } from '../../common/constants/user.constant';

export class InquiryProblemsSummaryDto {
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
  @IsIn(Object.values(PROBLEM_TYPE_MAP), {
    message: '올바른 문제 유형이 아닙니다',
    each: true,
  })
  typeList?: ProblemType[];

  @IsOptional()
  @IsEnum(Object.values(PROBLEM_SORT_MAP), {
    message: '올바른 정렬 방식이 아닙니다',
  })
  @ApiProperty({
    description: '문제 정렬',
    default: PROBLEM_SORT_MAP.DEFAULT,
    enum: Object.values(PROBLEM_SORT_MAP),
    enumName: 'ProblemSort',
    required: false,
  })
  sort: ProblemSort = PROBLEM_SORT_MAP.DEFAULT;

  @IsOptional()
  @IsEnum(Object.values(USER_PROBLEM_STATE), {
    message: '올바른 상태가 아닙니다',
    each: true,
  })
  @ApiProperty({
    description: '문제 상태',
    default: [],
    required: false,
    isArray: true,
  })
  states?: UserProblemState[];
}

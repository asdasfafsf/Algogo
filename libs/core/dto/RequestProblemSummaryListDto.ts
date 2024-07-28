import { IsNumber, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestProblemSummaryListDto {
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsNumber({}, { message: '페이지 번호는 숫자만 입력할 수 있습니다.' })
  @Min(0, {
    message: '페이지 번호는 0페이지보다 커야 합니다.',
  })
  pageNo?: number = 1;

  @IsIn([10, 20, 50], { message: '10, 20 또는 50 단위로만 조회가 가능합니다.' })
  @Transform(({ value }) => (value !== undefined ? Number(value) : 10))
  pageSize?: number = 10;

  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : []))
  levelList?: number[];

  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  typeList?: string[];
}

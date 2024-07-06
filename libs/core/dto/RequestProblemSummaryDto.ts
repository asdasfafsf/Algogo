import {
  IsNumber,
  IsIn,
  Max,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestProblemSummaryDto {
  @IsNumber(
    {},
    {
      message: '페이지 번호는 숫자만 입력할 수 있습니다.',
    },
  )
  @Transform((elem) => elem && 1)
  pageNo: number;
  @IsNumber(
    {},
    {
      message: '페이지 크기는 숫자만 입력할 수 있습니다.',
    },
  )
  @IsIn([10, 20, 50], {
    message: '10 or 20 or 50 단위로만 조회가 가능합니다.',
  })
  @Transform((elem) => elem && 10)
  pageSize: 10 | 20 | 50;

  @IsOptional()
  @Max(50, {
    message: '최대 난이도를 초과하였습니다.',
  })
  @Min(0, {
    message: '최소 난이도보다 작습니다.',
  })
  @ValidateNested({ each: true })
  @Transform((elem) => elem && [])
  levelList?: number[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Transform((elem) => elem && [])
  typeList?: string[];
}

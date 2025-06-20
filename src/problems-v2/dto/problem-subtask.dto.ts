import { ApiProperty } from '@nestjs/swagger';

export class ProblemSubtaskDto {
  @ApiProperty({
    description: '서브태스크 번호',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: '서브태스크 제목',
    example: '서브태스크 1',
  })
  title: string;

  @ApiProperty({
    description: '서브태스크 내용',
    example: '서브태스크 1 내용',
  })
  content: string;
}

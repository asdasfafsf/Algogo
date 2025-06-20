import { ApiProperty } from '@nestjs/swagger';

export class TodayProblemDto {
  @ApiProperty({
    description: '문제 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    description: '문제 제목',
    example: 'A+B',
  })
  title: string;

  @ApiProperty({
    description: '문제 난이도',
    example: 1,
  })
  level: number;

  @ApiProperty({
    description: '문제 난이도 텍스트',
    example: '브론즈 5',
  })
  levelText: string;

  @ApiProperty({
    description: '정답률',
    example: 85.5,
  })
  answerRate: number;

  @ApiProperty({
    description: '제출 수',
    example: 1000,
  })
  submitCount: number;

  @ApiProperty({
    description: '정답 수',
    example: 855,
  })
  answerCount: number;

  @ApiProperty({
    description: '정답자 수',
    example: 750,
  })
  answerPeopleCount: number;

  @ApiProperty({
    description: '문제 출처',
    example: 'BOJ',
  })
  source: string;

  @ApiProperty({
    description: '출처 사이트에서의 문제 ID',
    example: '1000',
  })
  sourceId: string;

  @ApiProperty({
    description: '출처 사이트 URL',
    example: 'https://www.acmicpc.net/problem/1000',
  })
  sourceUrl: string;

  @ApiProperty({
    description: '문제 유형 리스트',
    example: ['구현', '수학'],
    type: [String],
  })
  typeList: string[];

  @ApiProperty({
    description: '문제 난이도',
    example: '입문',
  })
  difficulty: string;
}

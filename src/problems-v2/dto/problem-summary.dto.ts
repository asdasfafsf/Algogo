import { ApiProperty } from '@nestjs/swagger';
import { ProblemType } from '../types/problem.type';
import { UserProblemState } from 'src/common/types/user.type';

export class ProblemSummaryDto {
  @ApiProperty({
    description: '문제의 고유 ID',
    example: 'a1b2c3d4-5678-90ef-gh12-34567890abcd',
  })
  uuid: string;

  @ApiProperty({
    description: '문제의 제목',
    example: '최단 경로 문제',
  })
  title: string;

  @ApiProperty({
    description: '문제의 난이도 텍스트',
    example: '상',
  })
  levelText: string;

  @ApiProperty({
    description: '정답 제출 횟수',
    example: 123,
  })
  answerCount: number;

  @ApiProperty({
    description: '정답률',
    example: 15.54,
  })
  answerRate: number;

  @ApiProperty({
    description: '전체 제출 횟수',
    example: 456,
  })
  submitCount: number;

  @ApiProperty({
    description: '정답을 맞힌 사람 수',
    example: 78,
  })
  answerPeopleCount: number;

  @ApiProperty({
    description: '문제 출처 (ex: 백준, 코드포스 등)',
    example: '백준',
  })
  source: string;

  @ApiProperty({
    description: '출처의 문제 ID',
    example: '1000',
  })
  sourceId: string;

  @ApiProperty({
    description: '출처 문제의 URL',
    example: 'https://www.acmicpc.net/problem/1000',
  })
  sourceUrl: string;

  @ApiProperty({
    description: '문제의 난이도',
    example: 5,
    type: Number,
  })
  level: number;

  @ApiProperty({
    description: '문제 유형 리스트',
    type: [String],
    example: ['그래프 탐색'],
  })
  typeList: ProblemType[];

  @ApiProperty({
    description: '문제 상태',
    example: 'NONE',
  })
  state: UserProblemState;
}

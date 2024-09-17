import { ApiProperty } from '@nestjs/swagger';
import { ResponseProblemContentDto } from './ResponseProblemContentDto';
import { ResponseProblemInputOutputDto } from './ResponseProblemInputOutputDto';

export class ResponseProblemDto {
  @ApiProperty({
    description: '문제 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({ description: '문제 제목', example: '두 수의 합' })
  title: string;

  @ApiProperty({ description: '문제 난이도', example: 3 })
  level: number;

  @ApiProperty({ description: '난이도 텍스트', example: '중급' })
  levelText: string;

  @ApiProperty({
    description: '입력 설명',
    example: '첫 번째 줄에 두 수가 입력됩니다.',
  })
  input: string;

  @ApiProperty({
    description: '출력 설명',
    example: '두 수의 합을 출력합니다.',
  })
  output: string;

  @ApiProperty({
    description: '힌트',
    example: '덧셈의 기본 개념을 사용합니다.',
  })
  hint: string;

  @ApiProperty({ description: '정답 제출 횟수', example: 10 })
  answerCount: number;

  @ApiProperty({ description: '정답 제출한 사람 수', example: 5 })
  answerPeopleCount: number;

  @ApiProperty({ description: '총 제출 횟수', example: 20 })
  submitCount: number;

  @ApiProperty({ description: '시간 제한(초)', example: 2 })
  timeout: number;

  @ApiProperty({ description: '메모리 제한(MB)', example: 128 })
  memoryLimit: number;

  @ApiProperty({ description: '출처', example: '백준' })
  source: string;

  @ApiProperty({ description: '출처 ID', example: '1000' })
  sourceId: string;

  @ApiProperty({
    description: '출처 URL',
    example: 'https://www.acmicpc.net/problem/1000',
  })
  sourceUrl: string;

  @ApiProperty({
    description: '문제 내용 리스트',
    type: [ResponseProblemContentDto],
  })
  contentList: ResponseProblemContentDto[];

  @ApiProperty({
    description: '입출력 예시 리스트',
    type: [ResponseProblemInputOutputDto],
  })
  inputOutputList: ResponseProblemInputOutputDto[];
}

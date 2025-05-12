import { ApiProperty } from '@nestjs/swagger';
import { ProblemType } from '../types/problem.type';
import { ProblemInputOutputDto } from './problem-input-output.dto';
export class ProblemDto {
  @ApiProperty({
    description: '문제 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    description: '문제 제목',
    example: '두 수의 합',
  })
  title: string;

  @ApiProperty({
    description: '문제 난이도',
    example: 3,
  })
  level: number;

  @ApiProperty({
    description: '난이도 텍스트',
    example: '중급',
  })
  levelText: string;

  @ApiProperty({
    description: '정답률',
    example: 15.54,
  })
  answerRate: number;

  @ApiProperty({
    description: '총 제출 횟수',
    example: 20,
  })
  submitCount: number;

  @ApiProperty({
    description: '시간 제한(초)',
    example: 2,
  })
  timeout: number;

  @ApiProperty({
    description: '메모리 제한(MB)',
    example: 128,
  })
  memoryLimit: number;

  @ApiProperty({
    description: '정답 제출 횟수',
    example: 10,
  })
  answerCount: number;

  @ApiProperty({
    description: '정답 제출한 사람 수',
    example: 5,
  })
  answerPeopleCount: number;

  @ApiProperty({
    description: '출처',
    example: '백준',
  })
  source: string;

  @ApiProperty({
    description: '출처 ID',
    example: '1000',
  })
  sourceId: string;

  @ApiProperty({
    description: '출처 URL',
    example: 'https://www.acmicpc.net/problem/1000',
  })
  sourceUrl: string;

  @ApiProperty({
    description: '문제 내용',
    example:
      '두 수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.',
  })
  content: string;

  @ApiProperty({
    description: '제한 사항',
    example: '시간 제한: 2초, 메모리 제한: 128MB',
    required: false,
  })
  limit?: string;

  @ApiProperty({
    description: '힌트',
    example: '덧셈의 기본 개념을 사용합니다.',
    required: false,
  })
  hint?: string;

  @ApiProperty({
    description: '서브태스크 정보',
    required: false,
  })
  subTask?: string;

  @ApiProperty({
    description: '입력 설명',
    example: '첫 번째 줄에 두 수가 입력됩니다.',
    required: false,
  })
  input?: string;

  @ApiProperty({
    description: '출력 설명',
    example: '두 수의 합을 출력합니다.',
    required: false,
  })
  output?: string;

  @ApiProperty({
    description: '프로토콜 정보',
    required: false,
  })
  protocol?: string;

  @ApiProperty({
    description: '기타 정보',
    required: false,
  })
  etc?: string;

  @ApiProperty({
    description: '추가 시간 허용 여부',
    default: false,
  })
  additionalTimeAllowed: boolean;

  @ApiProperty({
    description: '스페셜 저지 여부',
    default: false,
  })
  isSpecialJudge: boolean;

  @ApiProperty({
    description: '서브태스크 여부',
    default: false,
  })
  isSubTask: boolean;

  @ApiProperty({
    description: '함수형 문제 여부',
    default: false,
  })
  isFunction: boolean;

  @ApiProperty({
    description: '인터랙티브 문제 여부',
    default: false,
  })
  isInteractive: boolean;

  @ApiProperty({
    description: '투 스텝 문제 여부',
    default: false,
  })
  isTwoStep: boolean;

  @ApiProperty({
    description: '클래스 문제 여부',
    default: false,
  })
  isClass: boolean;

  @ApiProperty({
    description: '생성 시간',
  })
  createdAt: Date;

  @ApiProperty({
    description: '마지막 업데이트 시간',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '입출력 예시 리스트',
    type: [ProblemInputOutputDto],
  })
  inputOutputList: ProblemInputOutputDto[];

  @ApiProperty({
    description: '문제 유형 리스트',
    type: [String],
    example: ['그래프 탐색'],
  })
  typeList: ProblemType[];
}

import { Prisma } from '@prisma/client';
import { PROBLEM_SORT, ProblemSort } from '../constants/problem-sort.constant';

export function getProblemOrderBy(
  sort: ProblemSort,
): Prisma.ProblemOrderByWithRelationInput[] {
  switch (sort) {
    case PROBLEM_SORT.ANSWER_RATE_ASC:
      return [{ answerRate: 'asc' }];
    case PROBLEM_SORT.ANSWER_RATE_DESC:
      return [{ answerRate: 'desc' }];
    case PROBLEM_SORT.LEVEL_ASC:
      return [{ level: 'asc' }];
    case PROBLEM_SORT.LEVEL_DESC:
      return [{ level: 'desc' }];
    case PROBLEM_SORT.SUBMIT_COUNT_ASC:
      return [{ submitCount: 'asc' }];
    case PROBLEM_SORT.SUBMIT_COUNT_DESC:
      return [{ submitCount: 'desc' }];
    case PROBLEM_SORT.TITLE_ASC:
      return [{ title: 'asc' }];
    case PROBLEM_SORT.TITLE_DESC:
      return [{ title: 'desc' }];
    default:
      return [];
  }
}

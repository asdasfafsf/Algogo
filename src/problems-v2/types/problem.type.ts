import { PROBLEM_TYPE_MAP } from '../constants/problems-type';
import { PROBLEM_SORT_MAP } from '../constants/problems-sort';
export type ProblemType =
  (typeof PROBLEM_TYPE_MAP)[keyof typeof PROBLEM_TYPE_MAP];

export type ProblemSort =
  (typeof PROBLEM_SORT_MAP)[keyof typeof PROBLEM_SORT_MAP];

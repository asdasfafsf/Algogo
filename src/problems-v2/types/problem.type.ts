import { PROBLEM_TYPE_MAP } from '../constants/problems-type';
export type ProblemType =
  (typeof PROBLEM_TYPE_MAP)[keyof typeof PROBLEM_TYPE_MAP];

export type { ProblemSort } from '../../common/constants/problem-sort.constant';

import { PROBLEM_TYPE } from '../constants/problem.constant';

export type ProblemType = (typeof PROBLEM_TYPE)[keyof typeof PROBLEM_TYPE];

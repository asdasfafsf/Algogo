export const PROBLEM_SORT = {
  DEFAULT: 0,
  TITLE_ASC: 10,
  TITLE_DESC: 11,
  LEVEL_ASC: 20,
  LEVEL_DESC: 21,
  ANSWER_RATE_ASC: 30,
  ANSWER_RATE_DESC: 31,
  SUBMIT_COUNT_ASC: 40,
  SUBMIT_COUNT_DESC: 41,
} as const;

export type ProblemSort = (typeof PROBLEM_SORT)[keyof typeof PROBLEM_SORT];

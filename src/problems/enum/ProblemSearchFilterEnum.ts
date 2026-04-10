export const PROBLEM_SEARCH_FILTER = {
  DEFAULT: 0,
  TITLE: 1,
} as const;

export type ProblemSearchFilter =
  (typeof PROBLEM_SEARCH_FILTER)[keyof typeof PROBLEM_SEARCH_FILTER];

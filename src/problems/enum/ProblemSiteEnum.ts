export const PROBLEM_SITE = {
  BOJ: 'BOJ',
} as const;

export type ProblemSite = (typeof PROBLEM_SITE)[keyof typeof PROBLEM_SITE];

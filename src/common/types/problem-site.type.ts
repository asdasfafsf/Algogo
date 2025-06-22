import { PROBLEM_SITE_PROVIDER } from '../constants/problem-site.constant';

export type ProblemSiteProvider =
  (typeof PROBLEM_SITE_PROVIDER)[keyof typeof PROBLEM_SITE_PROVIDER];

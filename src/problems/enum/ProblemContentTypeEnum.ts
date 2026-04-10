export const PROBLEM_CONTENT_TYPE = {
  IMAGE: 'image',
  TEXT: 'text',
} as const;

export type ProblemContentType =
  (typeof PROBLEM_CONTENT_TYPE)[keyof typeof PROBLEM_CONTENT_TYPE];

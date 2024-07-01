import { ResponseProblemContent } from './ResponseProblemContent';

export class ResponseProblemDto {
  key: string;
  title: string;
  contentList?: ResponseProblemContent[];
  level: string;
  typeList: string[];
  answerRate: number;
  submitCount: number;
  timeout: number;
  memoryLimit: number;
  answerCount: number;
  answerPeopleCount: number;
  input: string;
  output: string;
  limit: string;
  sourceUrl: string;
  sourceId: string;
  source: string;
  inputOutputList: { input: string; output: string }[];
}

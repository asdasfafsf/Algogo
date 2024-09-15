import { ResponseProblemContentDto } from './ResponseProblemContentDto';

export class ResponseProblemDto {
  uuid: string;
  title: string;
  level: number;
  levelText: string;
  input: string;
  output: string;
  hint: string;
  answerCount: number;
  answerPeopleCount: number;
  submitCount: number;
  timeout: number;
  memoryLimit: number;
  source: string;
  sourceId: string;
  sourceUrl: string;
  contentList: ResponseProblemContentDto[];
}

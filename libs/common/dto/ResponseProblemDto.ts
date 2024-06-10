export class ResponseProblemDto {
  key: string;
  title: string;
  contentList?: string[];
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
  inputOutputList: { input: string; output: string }[];
}

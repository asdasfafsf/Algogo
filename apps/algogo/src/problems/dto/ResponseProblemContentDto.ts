import { ProblemContentType } from '../enum/ProblemContentTypeEnum';

export class ResponseProblemContentDto {
  order: number;
  type: ProblemContentType;
  content: string;
}

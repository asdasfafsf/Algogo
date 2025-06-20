export class ResponseProblemContent {
  type: string;
  content: string;
  order: number;
  cellList: {
    rowIndex: number;
    colIndex: number;
    content: string;
    isHeader: boolean;
  }[];
}

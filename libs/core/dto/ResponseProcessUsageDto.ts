export class ResponseProcessUsageDto {
  memory: number;
  cpu?: number;
  ppid?: number;
  pid?: number;
  processTime: number;
}

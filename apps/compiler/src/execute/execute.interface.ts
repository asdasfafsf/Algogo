import { ResponseExecuteDto } from '@libs/core/dto/ResponseExecuteDto';

export interface Execute {
  /**
   * 파일 확장자명
   */
  getFileExtension(): string;
  /**
   * 컴파일된 파일의 확장자명
   */
  getCompiledFileExtension(): string;
  /**
   * 컴파일 커맨드
   */
  getCompileCommand(): string;
  /**
   * 컴파일 커맨드 아규먼트
   * @param codePath 코드경로
   * @param compiledPath 컴파일된코드경로
   * @param code 코드
   */
  getCompileCommandArgs(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string[];
  /**
   * 실행커맨드
   */
  getExecuteCommand(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string;
  /**
   *
   * @param codePath 코드경로
   * @param compiledPath 컴파일된코드경로
   * @param code 코드
   */
  getExecuteCommandArgs(
    codePath: string,
    compiledPath: string,
    code: string,
  ): string[];

  /**
   *
   * @param code 코드
   * @returns 컴파일 결과의 풀 경로를 리턴한다
   */
  compile: (code: string) => Promise<string>;
  /**
   *
   * @param code 코드
   * @param input 입력값
   * @returns 실행 결과를 리턴한다.
   */
  execute: (code: string, input: string) => Promise<ResponseExecuteDto>;
  handleError: (error: Error) => Promise<void> | void;
}

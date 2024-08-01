import { ClangExecuteService } from './clang-execute.service';
import { CppExecuteService } from './cpp-execute.service';
import { JavaExecuteService } from './java-execute.service';
import { Java17ExecuteService } from './java17-execute.service';
import { JavascriptInterpretService } from './javascript-interpret.service';
import { PythonInterpretService } from './python-interpret.service';
import { Execute } from './execute.interface';
import { Provider } from '@nestjs/common';
export type ExecuteProvider =
  | 'cpp'
  | 'clang'
  | 'java'
  | 'java17'
  | 'javascript'
  | 'python';
export type ExecuteServiceFactory = {
  get: (provider: ExecuteProvider) => Promise<Execute> | Execute;
};
export const EXECUTE_SERVICE_FACTORY_NAME = 'EXECUTE_SERVICE_FACTORY';
export const executeProvider: Provider = {
  provide: EXECUTE_SERVICE_FACTORY_NAME,
  useFactory: (
    cpp: CppExecuteService,
    clang: ClangExecuteService,
    java: JavaExecuteService,
    java17: Java17ExecuteService,
    javascript: JavascriptInterpretService,
    python: PythonInterpretService,
  ) => {
    const services: { [key in ExecuteProvider]: Execute } = {
      cpp,
      clang,
      java,
      java17,
      javascript,
      python,
    };

    return {
      get: (provider: ExecuteProvider) => services[provider],
    };
  },
  inject: [
    CppExecuteService,
    ClangExecuteService,
    JavaExecuteService,
    Java17ExecuteService,
    JavascriptInterpretService,
    PythonInterpretService,
  ],
};

export default executeProvider;

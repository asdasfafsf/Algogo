import { ClangExecuteService } from './clang-execute.service';
import { CppExecuteService } from './cpp-execute.service';
import { JavaExecuteService } from './java-execute.service';
import { Java17ExecuteService } from './java17-execute.service';
import { JavascriptInterpretService } from './javascript-interpret.service';
import { PythonInterpretService } from './python-interpret.service';
import { Execute } from './execute.interface';
import { Provider } from '@nestjs/common';
import { LanguageProvider } from '../common/enum/LanguageProviderEnum';

export type ExecuteServiceFactory = {
  get: (provider: LanguageProvider) => Promise<Execute> | Execute;
};

export const EXECUTE_SERVICE_FACTORY_NAME = 'EXECUTE_SERVICE_FACTORY';

export const ExecuteProvider: Provider = {
  provide: EXECUTE_SERVICE_FACTORY_NAME,
  useFactory: (
    cpp: CppExecuteService,
    clang: ClangExecuteService,
    java: JavaExecuteService,
    java17: Java17ExecuteService,
    javascript: JavascriptInterpretService,
    python: PythonInterpretService,
  ) => {
    const services: { [key in LanguageProvider]: Execute } = {
      [LanguageProvider.CPP]: cpp,
      [LanguageProvider.CLANG]: clang,
      [LanguageProvider.JAVA]: java,
      [LanguageProvider.JAVA17]: java17,
      [LanguageProvider.NODEJS]: javascript,
      [LanguageProvider.PYTHON]: python,
    };

    return {
      get: (provider: LanguageProvider) => services[provider] ?? javascript,
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

export default ExecuteProvider;

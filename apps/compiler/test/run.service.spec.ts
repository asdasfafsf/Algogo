import { Test, TestingModule } from '@nestjs/testing';
import { RunService } from '../src/execute/run.service';
import { ExecuteModule } from '../src/execute/execute.module';
import executeProvider, {
  ExecuteProvider,
} from '../src/execute/execute.provider';
import { ConfigModule } from '@nestjs/config';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { ProcessModule } from '../src/process/process.module';
import { FileModule } from '../src/file/file.module';
import config from '../src/config/config';
import { join } from 'path';
import { ExecuteService } from '../src/execute/execute.service';
import { InterpretService } from '../src/execute/interpret.service';
import { PythonInterpretService } from '../src/execute/python-interpret.service';
import { JavascriptInterpretService } from '../src/execute/javascript-interpret.service';
import { JavaExecuteService } from '../src/execute/java-execute.service';
import { CppExecuteService } from '../src/execute/cpp-execute.service';
import { Java17ExecuteService } from '../src/execute/java17-execute.service';
import { ClangExecuteService } from '../src/execute/clang-execute.service';

describe('RunService', () => {
  let runService: RunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteService,
        InterpretService,
        PythonInterpretService,
        JavascriptInterpretService,
        JavaExecuteService,
        CppExecuteService,
        ClangExecuteService,
        Java17ExecuteService,
        RunService,
        executeProvider,
      ],
      imports: [
        ConfigModule.forRoot({
          envFilePath: [join(__dirname, '../src/config/env/.development.env')],
          isGlobal: true,
          load: [config],
        }),
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              level: 'silly',
              format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike('MyApp', {
                  prettyPrint: true,
                }),
              ),
            }),
          ],
        }),
        ProcessModule,
        FileModule,
        ExecuteModule,
      ],
    }).compile();

    runService = module.get<RunService>(RunService);
  });

  it('should be defined', () => {
    console.log('하이하이');
    console.log(runService);
    expect(runService).toBeDefined();
  });

  const providers: ExecuteProvider[] = [
    'java',
    'cpp',
    'clang',
    'java17',
    'javascript',
    'python',
  ];
  const successCodes: { [key in ExecuteProvider]: string } = {
    java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(input);
        scanner.close();
    }
}`,
    cpp: `#include <iostream>
#include <string>

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::cout << input << std::endl;
    return 0;
}`,
    clang: `#include <iostream>
#include <string>

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::cout << input << std::endl;
    return 0;
}`,
    java17: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(input);
        scanner.close();
    }
}`,
    javascript: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  console.log(input);
  rl.close();
});`,
    python: `input_string = input()
print(input_string)`,
  };

  providers.forEach(async (provider) => {
    it(`should execute code for provider: ${provider}`, async () => {
      const code = successCodes[provider];
      const input = `hello ${provider}`;

      const result = await runService.execute(provider, code, input);
      expect(result).toContain(`hello ${provider}`);
    });
  });
});

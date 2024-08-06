import { ExecuteProvider } from 'apps/compiler/src/execute/execute.provider';

export const successCodes: { [key in ExecuteProvider]: string } = {
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

import { ExecuteProvider } from 'apps/compiler/src/execute/execute.provider';

export const runtimeErrorCode: { [key in ExecuteProvider]: string } = {
  java: `public class Main {
    public static void main(String[] args) {
        String str = null;
        System.out.println(str.length()); // NullPointerException
    }
}`,
  cpp: `#include <iostream>

int main() {
    int* ptr = nullptr;
    std::cout << *ptr; // Segmentation fault
    return 0;
}`,
  clang: `#include <iostream>

int main() {
    int* ptr = nullptr;
    std::cout << *ptr; // Segmentation fault
    return 0;
}`,
  java17: `public class Main {
    public static void main(String[] args) {
        String str = null;
        System.out.println(str.length()); // NullPointerException
    }
}`,
  javascript: `const obj = null;
console.log(obj.property); // TypeError: Cannot read property 'property' of null
`,
  python: `obj = None
print(obj.property) # AttributeError: 'NoneType' object has no attribute 'property'
`,
};

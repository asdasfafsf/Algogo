import { ExecuteProvider } from 'apps/compiler/src/execute/execute.provider';

export const timeoutErrorCodes: { [key in ExecuteProvider]: string } = {
  java: `public class Main {
    public static void main(String[] args) {
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}`,
  cpp: `#include <iostream>
#include <thread>
#include <chrono>

int main() {
    std::this_thread::sleep_for(std::chrono::seconds(10));
    return 0;
}`,
  clang: `#include <iostream>
#include <thread>
#include <chrono>

int main() {
    std::this_thread::sleep_for(std::chrono::seconds(10));
    return 0;
}`,
  java17: `public class Main {
    public static void main(String[] args) {
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}`,
  javascript: `function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    await sleep(10000);
}

main();`,
  python: `import time

time.sleep(10)
`,
};

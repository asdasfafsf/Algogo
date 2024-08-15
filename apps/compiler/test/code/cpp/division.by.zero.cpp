#include <iostream>

int main() {
    int a = 10;
    int b = 0;

    int c = a / b; // 0으로 나누기 시도

    std::cout << "Result: " << c << std::endl;

    return 0;
}
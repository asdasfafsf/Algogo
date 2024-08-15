#include <iostream>

int main() {
    int x = 1;
    int y = 32; // 시프트 연산에서 너무 큰 지수 사용

    int result = x << y; // 잘못된 시프트 연산

    std::cout << "Result: " << result << std::endl;

    return 0;
}
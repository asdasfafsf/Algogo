#include <iostream>

int main() {
    float a = 1.0f;
    float b = 0.0f;

    float c = a / b; // 0으로 부동 소수점 나누기 시도

    std::cout << "Result: " << c << std::endl;

    return 0;
}
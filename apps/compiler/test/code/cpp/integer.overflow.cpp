#include <iostream>
#include <limits>

int main() {
    int maxInt = std::numeric_limits<int>::max(); // int의 최대값
    int overflowed = maxInt + 1; // 정수 오버플로우 발생

    std::cout << "Overflowed value: " << overflowed << std::endl;

    return 0;
}
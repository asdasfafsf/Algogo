#include <iostream>

int someFunction() {
    // 함수가 값을 반환하지 않음
}

int main() {
    int result = someFunction(); // 반환 값이 없어서 오류 발생 가능

    std::cout << "Result: " << result << std::endl;

    return 0;
}
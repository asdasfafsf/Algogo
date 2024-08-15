#include <iostream>

int main() {
    int* ptr = nullptr; // 널 포인터 초기화

    // 널 포인터를 역참조 시도
    int value = *ptr; // 런타임 오류 발생

    std::cout << "Value: " << value << std::endl;

    return 0;
}
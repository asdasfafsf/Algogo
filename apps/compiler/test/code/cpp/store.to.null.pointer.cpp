#include <iostream>

int main() {
    int* ptr = nullptr;

    *ptr = 100; // 널 포인터에 값 저장 시도

    std::cout << "Stored value: " << *ptr << std::endl;

    return 0;
}
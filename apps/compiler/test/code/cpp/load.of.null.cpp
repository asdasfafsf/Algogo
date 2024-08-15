#include <iostream>

int main() {
    int* ptr = nullptr;

    int value = *ptr; // 널 포인터를 역참조하여 값 로드 시도

    std::cout << "Value: " << value << std::endl;

    return 0;
}
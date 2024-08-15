#include <iostream>

void neverNull(int& ref) {
    ref = 42; // 참조된 값을 변경
}

int main() {
    int* ptr = nullptr;
    
    neverNull(*ptr); // 널 포인터를 참조로 전달하여 함수 호출

    std::cout << "Value: " << *ptr << std::endl;

    return 0;
}
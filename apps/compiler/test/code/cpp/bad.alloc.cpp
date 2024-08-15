#include <iostream>

int main() {
    // 매우 큰 메모리 할당 시도
    std::size_t size = static_cast<std::size_t>(-1); // 최대 크기
    int* ptr = new int[size]; // 할당 시도, 실패 시 bad_alloc 예외 발생

    // 메모리 해제 (실제로는 이 라인에 도달하지 않음)
    delete[] ptr;

    return 0;
}
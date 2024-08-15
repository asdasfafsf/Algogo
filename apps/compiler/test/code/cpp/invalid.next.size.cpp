#include <iostream>
#include <cstdlib>

int main() {
    int* ptr = (int*)std::malloc(10 * sizeof(int));

    std::free(ptr); // 메모리 해제
    ptr = (int*)std::malloc(5 * sizeof(int)); // 할당 크기 변경 후

    std::free(ptr); // 두 번째 메모리 해제 (invalid next size)

    return 0;
}
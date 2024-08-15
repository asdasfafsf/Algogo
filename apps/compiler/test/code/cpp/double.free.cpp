#include <iostream>
#include <cstdlib>

int main() {
    int* ptr = (int*)std::malloc(sizeof(int) * 10);

    std::free(ptr);  // 첫 번째 메모리 해제
    std::free(ptr);  // 두 번째 메모리 해제 (double free)

    return 0;
}
#include <iostream>
#include <cstdlib>

int main() {
    int* ptr = (int*)std::malloc(sizeof(int) * 10);

    std::free(ptr);  // 메모리 해제
    std::free(ptr + 1);  // 잘못된 포인터로 메모리 해제 시도

    return 0;
}
```​⬤
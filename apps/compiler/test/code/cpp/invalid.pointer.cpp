#include <iostream>
#include <cstdlib>

int main() {
    int* ptr = (int*)std::malloc(sizeof(int) * 10);
    if (ptr == nullptr) return 1;

    ptr += 5;
    std::free(ptr);

    return 0;
}
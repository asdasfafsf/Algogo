#include <iostream>

int main() {
    int arr[5] = {1, 2, 3, 4, 5};

    // 배열 경계를 넘어서 접근 (Out of Bounds)
    std::cout << arr[10] << std::endl;  // Undefined Behavior

    return 0;
}
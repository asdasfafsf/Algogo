#include <iostream>

int main() {
    // 부적절한 배열 크기로 배열 할당 시도
    int* arr = new int[-1]; // 음수 크기로 배열을 할당하려고 시도, std::bad_array_new_length 예외 발생

    // 메모리 해제 (실제로는 이 라인에 도달하지 않음)
    delete[] arr;

    return 0;
}
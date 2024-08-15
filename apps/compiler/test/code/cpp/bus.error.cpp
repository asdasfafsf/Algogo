#include <iostream>
#include <cstddef> // for std::size_t

int main() {
    // 정렬되지 않은 메모리 주소에 접근 시도
    char* ptr = new char[sizeof(int) + 1]; // 정렬되지 않은 메모리 할당
    int* intPtr = reinterpret_cast<int*>(ptr + 1); // 비정렬된 주소로 변환

    // 잘못된 주소에 값을 쓰려고 시도 - Bus Error 발생 가능
    *intPtr = 42;

    // 메모리 해제 (이 라인에 도달하지 않을 수 있음)
    delete[] ptr;

    return 0;
}
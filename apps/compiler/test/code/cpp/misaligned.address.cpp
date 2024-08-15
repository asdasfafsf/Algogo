#include <iostream>

int main() {
    char data[sizeof(int) + 1];
    int* misalignedPtr = reinterpret_cast<int*>(data + 1); // 잘못 정렬된 주소로 변환

    *misalignedPtr = 42; // 잘못된 주소에 쓰기 시도

    std::cout << "Misaligned write: " << *misalignedPtr << std::endl;

    return 0;
}
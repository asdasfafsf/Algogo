#include <iostream>

int main() {
    int* ptr = nullptr;

    *ptr = 42; // 널 포인터 역참조 시도, 세그멘테이션 오류 발생

    return 0;
}
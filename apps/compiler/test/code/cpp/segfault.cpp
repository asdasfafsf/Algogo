#include <iostream>

int main() {
    int* ptr = (int*)0xFFFFFFFF; // 매우 높은 주소를 설정 (보통 유효하지 않은 주소)

    *ptr = 42; // 유효하지 않은 메모리 위치에 쓰기 시도

    return 0;
}
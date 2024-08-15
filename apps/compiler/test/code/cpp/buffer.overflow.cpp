#include <iostream>
#include <cstring>

int main() {
    char buffer[10]; // 크기가 10인 버퍼 선언

    // 버퍼 오버플로우 발생: 20바이트의 데이터를 버퍼에 복사
    std::strcpy(buffer, "This is a very long string");

    std::cout << "Buffer contains: " << buffer << std::endl;

    return 0;
}
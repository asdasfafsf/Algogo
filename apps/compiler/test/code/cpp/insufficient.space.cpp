#include <iostream>
#include <cstring>

int main() {
    char buffer[10];

    std::strcpy(buffer, "This is a very long string"); // 버퍼에 충분한 공간이 없음

    std::cout << "Buffer contains: " << buffer << std::endl;

    return 0;
}
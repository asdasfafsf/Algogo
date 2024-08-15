#include <iostream>
#include <cstring>

int main() {
    char* buffer = new char[10];
    std::strcpy(buffer, "This is a string that is too long"); // 버퍼 크기를 초과하여 메모리 덮어쓰기

    std::cout << "Buffer contains: " << buffer << std::endl;

    delete[] buffer;
    return 0;
}
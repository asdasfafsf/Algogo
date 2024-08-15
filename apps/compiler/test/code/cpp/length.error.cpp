#include <iostream>
#include <string>

int main() {
    try {
        std::string str;
        str.reserve(str.max_size() + 1); // 최대 크기를 초과하여 길이 지정 시도
    } catch (...) {
        std::cout << "Length error caught." << std::endl;
    }

    return 0;
}
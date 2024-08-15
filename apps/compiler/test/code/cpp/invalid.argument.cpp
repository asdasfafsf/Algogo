#include <iostream>
#include <stdexcept>

int main() {
    std::string str = "123abc";
    int num = std::stoi(str); // 잘못된 인자로 std::invalid_argument 예외 발생

    std::cout << "Number: " << num << std::endl;

    return 0;
}
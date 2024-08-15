#include <iostream>
#include <vector>

int main() {
    std::vector<int> vec = {1, 2, 3};

    int value = vec.at(5); // 범위를 벗어난 인덱스에 접근 시도

    std::cout << "Value: " << value << std::endl;

    return 0;
}
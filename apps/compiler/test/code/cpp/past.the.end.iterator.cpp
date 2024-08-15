#include <iostream>
#include <vector>

int main() {
    std::vector<int> vec = {1, 2, 3};

    auto it = vec.end(); // 끝 이터레이터
    int value = *it; // 끝 이터레이터 역참조 시도

    std::cout << "Value: " << value << std::endl;

    return 0;
}
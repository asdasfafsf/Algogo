#include <iostream>
#include <vector>

int main() {
    std::vector<int> vec; // 빈 벡터 생성

    // 비어 있는 벡터에서 첫 번째 요소에 접근 시도
    int value = vec.at(0); // std::out_of_range 예외 발생

    std::cout << "First element: " << value << std::endl;

    return 0;
}
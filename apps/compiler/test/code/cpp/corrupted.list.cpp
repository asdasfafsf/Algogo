#include <iostream>
#include <list>

int main() {
    std::list<int> myList = {1, 2, 3};

    auto it = myList.begin();
    myList.erase(it);  // 첫 번째 요소 삭제

    *it = 10;  // 삭제된 요소에 접근 시도 (리스트가 손상됨)

    return 0;
}
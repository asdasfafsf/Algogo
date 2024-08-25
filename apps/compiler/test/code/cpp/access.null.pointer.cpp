#include <iostream>

struct Node {
    int data;
    Node* next;
};

int main() {
    Node* head = nullptr;  // 널 포인터 초기화

    // 널 포인터를 역참조하여 오류 발생
    std::cout << "Accessing head->data (this will cause an error): " << head->data << std::endl;

    return 0;
}
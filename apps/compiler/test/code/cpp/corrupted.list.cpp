#include <iostream>
#include <cstdlib>

struct Node {
    int data;
    Node* next;
    Node* prev;
};

int main() {
    // 이중 연결 리스트의 노드를 동적으로 생성
    Node* node1 = (Node*)malloc(sizeof(Node));
    Node* node2 = (Node*)malloc(sizeof(Node));
    
    // 노드들을 연결
    node1->data = 1;
    node1->next = node2;
    node1->prev = nullptr;

    node2->data = 2;
    node2->next = nullptr;
    node2->prev = node1;

    // 의도적으로 포인터를 손상시켜 오류 발생
    node1->next = nullptr;  // 잘못된 조작으로 node1의 next를 잘못 설정
    node2->prev = nullptr;  // 잘못된 조작으로 node2의 prev를 잘못 설정

    // 메모리 해제 - 이 시점에서 "corrupted double-linked list" 오류 발생 가능
    free(node1);  // node1을 해제하려고 하지만, 손상된 리스트로 인해 문제가 발생할 수 있음
    free(node2);  // node2도 마찬가지로 문제가 발생할 수 있음

    return 0;
}
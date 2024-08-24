#include <stdio.h>
#include <stdlib.h>

int main() {
    int* ptr = (int*)malloc(10 * sizeof(int));
    free(ptr);  // 메모리 해제

    // 해제된 메모리에 접근 시도 (Use after free)
    ptr[0] = 10;  // 이 부분에서 오류 발생 가능
}
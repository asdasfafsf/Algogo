#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    char name[20];
} Employee;

int main() {
    Employee* empList;
    int empCount = 5;

    empList = (Employee*)malloc(empCount * sizeof(Employee));

    for (int i = 0; i <= empCount; i++) {
        empList[i].id = i + 1;
        snprintf(empList[i].name, sizeof(empList[i].name), "Employee %d", i + 1);
    }

    for (int i = 0; i <= empCount; i++) {
        printf("ID: %d, Name: %s\n", empList[i].id, empList[i].name);
    }

    free(empList);

    return 0;
}
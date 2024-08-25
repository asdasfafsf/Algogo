#include <iostream>
#include <vector>
using namespace std;
int main() {
    int a = 2147483647;
    a += 1;
    cout << a << '\n';
    vector<int> d(10);
    d[1000] = 100;
    return 0;
}

#include <vector>
#include <algorithm>
#include <cstring>
#include <iostream>

using namespace std;
#define DIV 1000000
#define MAX 10
#define endl '\n'
#define All(v) v.begin(), v.end()

typedef long long ll;

int N, M, start = 100, ans = 0;
vector<char> workingNum(10);
string tempString, closestNum, ntostr;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    cout.tie(nullptr);
    cin >> N >> M;
    for (int i = 0; i < 10; i++) {
        workingNum[i] = char('0' + i);
    }

    if (N == start)
        cout << 0;
    else {
        for (int i = 0; i < M; i++) {
            int num;
            cin >> num;
            workingNum.erase(workingNum.begin() + num - i);
        }

        if (workingNum.empty())
            cout << abs(N - 100) << endl;
        else {
            // 확장된 숫자를 가진 문자열
            ntostr = to_string(N);
            for (int i = 1; i <= ntostr.size(); i++) {
                int temp = stoi(ntostr.substr(0, i));

                char tempChar;
                int absMin = 987654321;
                // 순간순간 비교를 위해 임시 저장하는 문자열

                for (auto c : workingNum) {

                    tempString = closestNum;
                    tempString += c;

                    if (abs(temp - stoi(tempString)) < absMin) {
                        absMin = abs(temp - stoi(tempString));
                        tempChar = c;
                    }
                }
                closestNum += tempChar;
                ans++;
            }

            int num = stoi(closestNum);
            ans += abs(num - N);
            cout << min(ans, abs(100 - N)) << endl;
        }
    }

    return 0;
}
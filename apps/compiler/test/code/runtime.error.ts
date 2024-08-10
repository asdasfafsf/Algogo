import { ExecuteProvider } from 'apps/compiler/src/execute/execute.provider';

export const runtimeErrorCode: { [key in ExecuteProvider]: string } = {
  java: `public class Main {
    public static void main(String[] args) {
        String str = null;
        System.out.println(str.length()); // NullPointerException
    }
}`,
  cpp: `#include <iostream>

using namespace std;

int main(void) {
    int n;
    cin >> n;

    int* arr = new int[n - 1];
    for (int i = 0; i < n; i++) {
        int b;
        cin >> b;
        arr[i] = b;
    }
   int m;
   int cnt = 0;
   cin >> m;
   for (int i = 0; i < n; i++) {
       if (arr[i] == m) {
           cnt++;
       }
   }
   cout << cnt << endl;

   return 0;
    
}
`,
  clang: `#include <bits/stdc++.h>
using namespace std;
int n, m, i, j, temp, psum[10004];
int main() {
	ios_base::sync_with_stdio(0);
	cin.tie(NULL);
	cout.tie(NULL);
	cin >> n >> m;
	for (int i = 1; i <= n; i++) {
		cin >> temp;
		psum[i] = psum[i - 1] + temp;
	}
	for (int k = 0; k < m; k++) {
		cin >> i >> j;
		cout << psum[j] - psum[i - 1] << "\n";
	}
	return 0;
}`,
  java17: `public class Main {
    public static void main(String[] args) {
        String str = null;
        System.out.println(str.length()); // NullPointerException
    }
}`,
  javascript: `const obj = null;
console.log(obj.property);
`,
  python: `obj = None
print(obj.property);
`,
};

import { ExecuteProvider } from 'apps/compiler/src/execute/execute.provider';

export const stackoverflowCodes: { [key in ExecuteProvider]: string } = {
  java: `public class Main {
    public static void main(String[] args) {
        MyClass instance = new MyClass();
    }
}

class MyClass {
    private MyClass self;

    public MyClass() {
        this.self = new MyClass(true);
    }

    private MyClass(boolean isInner) {
        this.self = new MyClass(true); // 무한 재귀 호출
    }
}`,
  cpp: `
 #include<stdio.h>
#include<iostream>
#include<vector>
#include<queue>
#include<tuple>
#include<memory.h>
#include<string>
#include<sstream>
#include<algorithm>
#include<map>
#include<set>
#include<iomanip>
#include<climits>
#include <functional>

using namespace std;

int dir[][2] = { {-1,0}, {0,1}, {1,0} ,{0,-1} };

vector<int> parent;
int findParent(int a)
{
	if (parent[a] == a)
		return a;
	return parent[a] = findParent(parent[a]);
}
void Union(int a, int b)
{
	parent[findParent(b)] = findParent(a);
}
bool IsUnion(int a, int b)
{
	return findParent(a) == findParent(b);
}

int l, n;
vector<string> s;
vector<string> ss;
bool ans = false;
vector<bool> visit;

void f2()
{
	for(int i=0;i<l;i++)
		for (int j = 0; j < i; j++)
		{
			if (s[i][j] != s[j][i])
				return;
		}
	ans = true;
	for (int i = 0; i < l; i++)
		cout << s[i] << "\n";
}
void f(int floor)
{

	f2();
	
	for (int i = 0; i < n; i++)
	{
		s.push_back(ss[i]);
		f(floor + 1);
		s.pop_back();
	}
}
int main()
{
	cin >> l >> n;
	visit.resize(n);
	for (int i = 0; i < n; i++)
	{
		string s;
		cin >> s;
		::ss.push_back(s);
	}
	sort(ss.begin(), ss.end());
	f(0);
	if (ans==false)
		cout << "NONE";
}

`,
  clang: `
   #include<stdio.h>
#include<iostream>
#include<vector>
#include<queue>
#include<tuple>
#include<memory.h>
#include<string>
#include<sstream>
#include<algorithm>
#include<map>
#include<set>
#include<iomanip>
#include<climits>
#include <functional>

using namespace std;

int dir[][2] = { {-1,0}, {0,1}, {1,0} ,{0,-1} };

vector<int> parent;
int findParent(int a)
{
	if (parent[a] == a)
		return a;
	return parent[a] = findParent(parent[a]);
}
void Union(int a, int b)
{
	parent[findParent(b)] = findParent(a);
}
bool IsUnion(int a, int b)
{
	return findParent(a) == findParent(b);
}

int l, n;
vector<string> s;
vector<string> ss;
bool ans = false;
vector<bool> visit;

void f2()
{
	for(int i=0;i<l;i++)
		for (int j = 0; j < i; j++)
		{
			if (s[i][j] != s[j][i])
				return;
		}
	ans = true;
	for (int i = 0; i < l; i++)
		cout << s[i] << "\n";
}
void f(int floor)
{

	f2();
	
	for (int i = 0; i < n; i++)
	{
		s.push_back(ss[i]);
		f(floor + 1);
		s.pop_back();
	}
}
int main()
{
	cin >> l >> n;
	visit.resize(n);
	for (int i = 0; i < n; i++)
	{
		string s;
		cin >> s;
		::ss.push_back(s);
	}
	sort(ss.begin(), ss.end());
	f(0);
	if (ans==false)
		cout << "NONE";
}

`,
  java17: `public class Main {
    public static void main(String[] args) {
        MyClass instance = new MyClass();
    }
}

class MyClass {
    private MyClass self;

    public MyClass() {
        this.self = new MyClass(true);
    }

    private MyClass(boolean isInner) {
        this.self = new MyClass(true); // 무한 재귀 호출
    }
}`,
  javascript: `
    const input = require('fs')
    .readFileSync(0, 'utf-8')
    .toString()
    .trim()
    .split('\n')
    .map(elem => elem.trim());


const [L, N] = input[0].split(' ').map(Number);
const words = input.slice(1);
words.sort((a, b) => a.localeCompare(b));

const visited = Array(words.length).fill(false);

const recursion = (depth, path) => {
    if (depth === L) {
        const target = [];
        for (const index of path) {
            target.push(words[index]);
        }

        let isOk = true;
        for (let i = 0; i < target.length; i++) {

            for (let j = 0; j < target.length; j++) {
                if (target[i][j] !== target[j][i]) {
                    isOk = false;
                    break;
                }
            }
        }
    }

    for (let i = 0; i < words.length; i++) {
        if (visited[i]) {
            continue;
        }

        path.push(i);
        recursion(depth + 1, path);
        path.pop();
    }
}

recursion(0, [])`,
  python: `
    def recursion(a, b, c):
        d = a + b + c
        if d % 2 == 0:
            print(f"Even: {d}")
            if d % 4 == 0:
                recursion(b, c, d)
            else:
                recursion(c, d, b)
        else:
            print(f"Odd: {d}")
            if d % 3 == 0:
                recursion(c, a, d)
            else:
                recursion(a, d, b)

    recursion(1, 1, 1)
  `,
};

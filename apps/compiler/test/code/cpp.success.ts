export const cppCode = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;


int n;
int alphabet[30];
int main() {
	ios::sync_with_stdio(0); cin.tie(0); cout.tie(0);
	cin >> n; cin.ignore();
	vector<string> inputs(n);
	vector<char> alpha;
	for (int i = 0; i < n; i++) {
		getline(cin, inputs[i]);
		for (auto j : inputs[i]) {
			alpha.push_back(j);
		}
	}
	sort(alpha.begin(), alpha.end());
	alpha.erase(unique(alpha.begin(), alpha.end()), alpha.end());

	int m = alpha.size();
	vector<int> score(m);
	for (int i = 0; i < m; i++) {
		score[i] = 9 - m + 1 + i;
	}

	int maxsum = 0;
	do {
		int tmpsum = 0;
		for (int i = 0; i < m; i++) {
			alphabet[alpha[i] - 'A'] = score[i];
		}
		for (int i = 0; i < n; i++) {
			int tmp = 0;
			for (int j = 0; j < inputs[i].size(); j++) {
				tmp = 10 * tmp + alphabet[inputs[i][j] - 'A'];
			}
			
			tmpsum += tmp;
		}

		maxsum = max(maxsum, tmpsum);
	} while (next_permutation(score.begin(), score.end()));

	cout << maxsum;
}`;

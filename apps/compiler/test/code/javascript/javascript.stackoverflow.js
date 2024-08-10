console.log('왜 아무일도 안일어느는걸까요?');
const input = require('fs')
  .readFileSync(0, 'utf-8')
  .toString()
  .trim()
  .split('\n')
  .map((elem) => elem.trim());

const [L, N] = input[0].split(' ').map(Number);
const words = input.slice(1);
words.sort((a, b) => a.localeCompare(b));

const visited = Array(words.length).fill(false);

console.log('왜 또 아무일도 안일어나는걸까요?');
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
    path.push(i);
    recursion(depth + 1, path);
    path.pop();
  }
};

recursion(0, []);

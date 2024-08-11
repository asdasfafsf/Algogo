// StackSizeExceeded 예제
let count = 0;
function recursiveFunction() {
  console.log('왜 안터짐?' + ++count);
  recursiveFunction(); // 자신을 무한히 호출하여 StackSizeExceeded 오류 발생
}

recursiveFunction();

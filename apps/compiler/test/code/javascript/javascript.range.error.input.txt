// RangeError 예제
function createLargeArray() {
  let arr = new Array(-1); // RangeError: Invalid array length
  console.log(arr);
}

createLargeArray();

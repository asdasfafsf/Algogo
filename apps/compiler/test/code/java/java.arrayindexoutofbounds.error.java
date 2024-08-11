public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3};
        int result = numbers[5]; // 유효한 인덱스 범위는 0, 1, 2입니다. 인덱스 5에 접근하려고 하면 ArrayIndexOutOfBoundsException이 발생합니다.
        System.out.println("Result: " + result);
    }
}
public class Main {
    public static void main(String[] args) {
        int result = 10 / 0; // 이 줄에서 ArithmeticException: / by zero가 발생합니다.
        System.out.println("Result: " + result);
    }
}
public class Main {
    public static void main(String[] args) {
        printSquareRoot(-1);
    }

    public static void printSquareRoot(int number) {
        if (number < 0) {
            throw new IllegalArgumentException("Number must be non-negative"); // 이 줄에서 IllegalArgumentException이 발생합니다.
        }
        System.out.println(Math.sqrt(number));
    }
}
import java.util.InputMismatchException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Please enter an integer:");

        // 사용자가 정수가 아닌 값을 입력하면 InputMismatchException이 발생합니다.
        int number = scanner.nextInt();

        System.out.println("You entered: " + number);
    }
}
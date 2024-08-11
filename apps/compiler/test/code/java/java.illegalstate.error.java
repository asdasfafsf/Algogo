import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        scanner.close(); // 스캐너를 닫은 후에 다시 메서드를 호출하면 IllegalStateException이 발생합니다.

        // 이미 닫힌 스캐너에서 입력을 시도하여 IllegalStateException 발생
        System.out.println("Enter something: ");
        String input = scanner.nextLine(); // 이 줄에서 IllegalStateException이 발생합니다.

        System.out.println("You entered: " + input);
    }
}
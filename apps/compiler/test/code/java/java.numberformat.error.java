public class Main {
    public static void main(String[] args) {
        String invalidNumber = "123abc";

        // 숫자로 변환할 수 없는 문자열을 정수로 변환하려고 시도하여 NumberFormatException 발생
        int number = Integer.parseInt(invalidNumber); // 이 줄에서 NumberFormatException이 발생합니다.

        System.out.println("Parsed number: " + number);
    }
}
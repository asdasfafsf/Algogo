public class Main {
    public static void main(String[] args) {
        // %d는 정수를 기대하지만, 문자열을 전달하여 IllegalFormatConversionException이 발생합니다.
        String result = String.format("The number is %d", "not a number");

        System.out.println(result);
    }
}
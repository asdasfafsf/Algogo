public class Main {
    public static void main(String[] args) {
        String str = null;

        // null 참조에서 메서드를 호출하려고 시도하여 NullPointerException 발생
        int length = str.length(); // 이 줄에서 NullPointerException이 발생합니다.

        System.out.println("String length: " + length);
    }
}
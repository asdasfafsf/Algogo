public class Main {
    public static void main(String[] args) {
        String str = "Hello";

        // 유효한 인덱스는 0부터 4까지입니다. 인덱스 10에 접근하려고 하면 StringIndexOutOfBoundsException이 발생합니다.
        char ch = str.charAt(10); // 이 줄에서 StringIndexOutOfBoundsException이 발생합니다.

        System.out.println("Character at index 10: " + ch);
    }
}
public class Main {
    public static void main(String[] args) {
        Object obj = "This is a string";
        Integer num = (Integer) obj; // 이 줄에서 ClassCastException이 발생합니다.
        System.out.println("Number: " + num);
    }
}
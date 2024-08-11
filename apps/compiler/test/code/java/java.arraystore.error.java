public class Main {
    public static void main(String[] args) {
        Object[] array = new Integer[3]; // Integer 타입의 배열을 선언
        array[0] = "This will cause ArrayStoreException"; // String 타입을 배열에 넣으려고 시도, ArrayStoreException 발생
    }
}
public class Main {
    public static void main(String[] args) {
        int size = -5;

        // 음수 크기로 배열을 생성하려고 시도하여 NegativeArraySizeException 발생
        int[] array = new int[size];

        System.out.println("Array created with size: " + array.length);
    }
}
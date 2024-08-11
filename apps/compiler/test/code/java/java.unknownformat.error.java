public class Main {
    public static void main(String[] args) {
        // 잘못된 형식 지정자 %q를 사용하여 UnknownFormatConversionException 발생
        String result = String.format("This is an invalid format: %q", "test");

        System.out.println(result);
    }
}
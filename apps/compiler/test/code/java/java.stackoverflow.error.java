public class Main {
    public static void main(String[] args) {
        recursiveMethod();
    }

    public static void recursiveMethod() {
        // 종료 조건 없이 재귀 호출을 계속하여 StackOverflowError 발생
        recursiveMethod();
    }
}
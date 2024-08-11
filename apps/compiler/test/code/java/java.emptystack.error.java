import java.util.Stack;
import java.util.EmptyStackException;

public class Main {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();

        // 빈 스택에서 pop 시도 - EmptyStackException 발생
        int value = stack.pop(); // 이 줄에서 EmptyStackException이 발생합니다.

        System.out.println("Value: " + value);
    }
}
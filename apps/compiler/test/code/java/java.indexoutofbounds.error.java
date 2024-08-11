import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("one");
        list.add("two");
        list.add("three");

        // 유효한 인덱스는 0, 1, 2입니다. 인덱스 5에 접근하려고 하면 IndexOutOfBoundsException이 발생합니다.
        String item = list.get(5);

        System.out.println("Item: " + item);
    }
}
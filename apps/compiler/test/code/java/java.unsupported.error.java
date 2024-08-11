import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("one");
        list.add("two");

        // 리스트를 변경 불가능하게 만듭니다.
        List<String> unmodifiableList = Collections.unmodifiableList(list);

        // 변경 불가능한 리스트에 요소를 추가하려고 시도하여 UnsupportedOperationException 발생
        unmodifiableList.add("three"); // 이 줄에서 UnsupportedOperationException이 발생합니다.

        System.out.println("List: " + unmodifiableList);
    }
}
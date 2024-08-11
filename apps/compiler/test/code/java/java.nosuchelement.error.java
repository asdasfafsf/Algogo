import java.util.Iterator;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("one");
        list.add("two");

        Iterator<String> iterator = list.iterator();

        // 모든 요소를 반복
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }

        // 요소가 없는데도 next()를 호출하여 NoSuchElementException 발생
        String element = iterator.next(); // 이 줄에서 NoSuchElementException이 발생합니다.

        System.out.println("Next element: " + element);
    }
}
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class Main {
    public static void main(String[] args) throws FileNotFoundException {
        File file = new File("non_existent_file.txt");

        // 존재하지 않는 파일을 열려고 시도 - FileNotFoundException 발생
        FileInputStream fis = new FileInputStream(file);

        System.out.println("File opened successfully");
    }
}
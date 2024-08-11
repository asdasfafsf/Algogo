import java.security.AccessControlException;
import java.security.Permission;

public class Main {
    public static void main(String[] args) {
        throw new AccessControlException("d");
    }
}
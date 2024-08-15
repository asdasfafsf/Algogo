public class Main {
    static int i = 1;
    public static void main(String[] args) {
        recursiveMethod();
    }

    public static void recursiveMethod() {
        new DEF();
    }
}



class DEF {
    DEF aa;
    DEF() {
        this.aa = new DEF();
    }
}
import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        BigInteger bigInt = new BigInteger("123456789012345678901234567890");
        
        // 큰 수에 대해 비정상적인 연산으로 ArithmeticException 발생 가능
        BigInteger result = bigInt.divide(BigInteger.ZERO); // divide by zero는 아니지만, 연산 중에 발생할 수 있는 예외

        System.out.println("Result: " + result);
    }
}
def check_positive_number(number):
    assert number > 0, "Number must be positive"

# 자연스럽게 AssertionError 발생
check_positive_number(-5)  # -5는 양수가 아니므로 AssertionError 발생
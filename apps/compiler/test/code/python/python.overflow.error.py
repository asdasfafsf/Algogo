import math

def cause_overflow():
    # 매우 큰 값을 지수 함수로 계산하려고 할 때 OverflowError 발생 가능
    return math.exp(1000)  # math.exp(1000)은 매우 큰 수를 반환하려고 하며, 이는 OverflowError를 발생시킬 수 있음

# 자연스럽게 OverflowError 발생
result = cause_overflow()
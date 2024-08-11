def convert_to_integer(value):
    return int(value)

# 자연스럽게 ValueError 발생
result = convert_to_integer("abc")  # "abc"는 정수로 변환할 수 없으므로 ValueError 발생
def use_undefined_variable():
    print(undeclared_variable)  # undeclared_variable이 정의되지 않았으므로 NameError 발생

# 자연스럽게 NameError 발생
use_undefined_variable()
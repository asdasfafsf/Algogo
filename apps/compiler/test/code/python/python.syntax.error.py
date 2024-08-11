def syntax_error_example():
    eval('print("Hello World"')  # 닫는 괄호가 빠져있어 SyntaxError 발생

# 자연스럽게 SyntaxError 발생
syntax_error_example()
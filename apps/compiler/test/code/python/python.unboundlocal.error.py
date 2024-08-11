def example_function():
    print(my_var)  # my_var가 아직 할당되지 않았으므로 UnboundLocalError 발생
    my_var = 10

# 자연스럽게 UnboundLocalError 발생
example_function()
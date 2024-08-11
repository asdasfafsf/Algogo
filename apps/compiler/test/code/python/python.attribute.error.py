class MyClass:
    def __init__(self):
        self.value = 10

def access_nonexistent_attribute(obj):
    return obj.nonexistent_attribute  # MyClass에는 nonexistent_attribute가 없으므로 AttributeError 발생

# 자연스럽게 AttributeError 발생
my_object = MyClass()
result = access_nonexistent_attribute(my_object)
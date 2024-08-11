def access_list_element(lst, index):
    return lst[index]

# 자연스럽게 IndexError 발생
my_list = [1, 2, 3]
result = access_list_element(my_list, 5)  # 리스트의 유효한 인덱스 범위는 0, 1, 2이므로 5에 접근하려고 하면 IndexError 발생
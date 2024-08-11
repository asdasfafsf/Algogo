def read_file():
    with open('nonexistent_file.txt', 'r') as file:
        content = file.read()
    return content

# 자연스럽게 FileNotFoundError 발생
content = read_file()
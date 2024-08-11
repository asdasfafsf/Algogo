def import_nonexistent_module():
    import nonexistent_module  # nonexistent_module이라는 모듈은 존재하지 않으므로 ModuleNotFoundError 발생

# 자연스럽게 ModuleNotFoundError 발생
import_nonexistent_module()
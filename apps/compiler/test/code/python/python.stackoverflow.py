def func(n):
    print(n)
    if n<1:
        return
    else:
        return func(n-1)
func(1000)
 
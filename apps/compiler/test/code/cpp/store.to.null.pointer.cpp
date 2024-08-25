#include <stdio.h>
#include <stdlib.h>

int compare(const void *a, const void *b) {
	long long num1 = *(long long *)a;
	long long num2 = *(long long *)b;

	if(num1 < num2)
		return -1;
	else if(num1 > num2)
		return 1;

	return 0;
}

long long euler_phi(long long n) {
	long long result = n;
	long long  i;
	
	for(i=2; i*i<=n; i++) {
		if(n%i==0) {
			result -= result/i;
			while(n%i==0)
				n/=i;
		}
	}
	
	if(n>1)
		result -= result/n;
	
	return result;
}

int main(void) {
	long long n;
	long long * arr;
	long long arr_count=0;
	long long result=-1;
	long long i;
	
	scanf("%lld", &n);
	arr = (long long *) malloc(sizeof(long long)*n);
	
	for(i=1; i*i<=n; i++) {
		if(n%i==0)
			arr[arr_count++]=i;
		if(i!=n/i)
			arr[arr_count++]=n/i;
	}
	
	qsort(arr, arr_count, sizeof(long long), compare);
	
	for(i=1; i<arr_count; i++)
		if(arr[i]*euler_phi(arr[i]) == n)
			result = arr[i];
	
	printf("%lld\n", result);
	
	return 0;	
}
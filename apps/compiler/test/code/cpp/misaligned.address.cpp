#include<iostream>

 

void DFS(int** arr,int x,int y,int n,int num,int *R);

void Qsort(int* arr, int l, int r);

int Qpartition(int* arr,int l,int r);

 

int main() {

	int n,num=0;

	scanf("%d", &n);

	int* R = NULL;
    R=(int*)malloc(sizeof(int) * n);

    

	int** arr=(int**)malloc(sizeof(int*) * n);

	for (int i = 0;i < n;i++)

	{

		arr[i] = (int*)malloc(sizeof(int) * n);

	}

 

	for (int i = 0;i < n;i++)//입력

	{

		for (int j = 0;j < n;j++)

		{

			scanf("%1d", &arr[i][j]);

		}

	}



 

	//R배열 쓰기 전 0으로 초기화할 것.

 

	for (int i = 0;i < n;i++)

	{

		for (int j = 0;j < n;j++)

		{

			if (arr[i][j] == 1) {

				R[num] = 0;

				DFS(arr, i, j, n, num, R);

				num++;

			}

		}

	}



	Qsort(R, 0, num-1);

	printf("%d\n", num);

	for (int i = 0;i < num;i++)printf("%d\n", R[i]);

 
    for(int i=0;i<n;i++)free(arr[i]);
    free(arr);
    free(R);
 

 

 

 

}

void DFS(int** arr,int x,int y,int n,int num,int*R) {

	if (x < 0 || x >= n || y < 0 || y >= n)//범위 벗어나는 것 먼저 체크

		return;

	if (arr[x][y] != 1)//1인 것 체크
	return;

	//위로 한칸은 노필요

	arr[x][y] = -1;

	R[num]++;

	DFS(arr, x , y-1, n, num, R);

	DFS(arr, x - 1, y, n, num, R);//좌측

	DFS(arr, x + 1, y, n, num, R);//우측

	DFS(arr, x, y + 1, n, num, R);//아래측

 

 

 

}

 

int Qpartition(int* arr, int l, int r)

{

	int p = l, q = r-1;

	int pivot = arr[r];

	int temp;

	while (p <= q)

	{

		while (p<=q && arr[p] < pivot)p++;

		while (p<=q && arr[q] >= pivot)q--;

		if (p<q) {//swap


			temp = arr[p];

			arr[p] = arr[q];

			arr[q] = temp;

		}

	}

    arr[r] = arr[p];
	arr[p] = pivot;

	

	return p;

}

 

void Qsort(int* arr, int l, int r)

{

	if (l < r) {

		int mid = Qpartition(arr, l, r);

		Qsort(arr, l, mid-1);//left Qsort;

		Qsort(arr, mid + 1, r);

	}

}
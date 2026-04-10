# ALGOGO-38: getProblemOrderBy 중복 코드 제거

## 문제

problems(v1)과 problems-v2 두 repository에 동일한 `getProblemOrderBy` private 메서드가 존재했다. 정렬 로직 변경 시 두 곳을 동시에 수정해야 하고, 정렬 상수도 `PROBLEM_SORT`와 `PROBLEM_SORT_MAP`으로 이름만 다른 동일한 값이 있었다.

## 검토한 대안

| 대안 | 설명 | 장점 | 단점 |
|------|------|------|------|
| A. v1 모듈에서 export | problems 모듈의 함수를 problems-v2에서 import | 기존 코드 이동 최소 | v2가 v1에 의존하게 됨 (역방향) |
| B. common/utils에 추출 | 두 모듈 모두 common에서 import | 양방향 의존 없음, 진정한 공유 코드 | common/ 파일 하나 추가 |

## 결정

B안: `common/utils/problem-order-by.util.ts`에 순수 함수로 추출하고, `common/constants/problem-sort.constant.ts`에 상수를 통합했다.

## 이유

v2가 v1에 의존하면 v1 삭제 시 다시 이동해야 한다. common/에 두면 두 모듈 모두 안정적으로 참조할 수 있다. 정렬 로직은 Prisma orderBy 객체를 반환하는 순수 함수이므로 common/utils에 적합하다.

## 참고

- PR: #133

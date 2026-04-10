# ALGOGO-29: NestJS 10 → 11 메이저 업그레이드

## 문제

NestJS 10은 Express v4 기반으로, 보안 패치와 성능 개선이 제한적이었다. NestJS 11이 Express v5를 기본 통합하면서 라우팅 엔진과 타입이 변경되었다.

## 검토한 대안

| 대안 | 설명 | 장점 | 단점 |
|------|------|------|------|
| A. 현재 유지 | NestJS 10 계속 사용 | 변경 리스크 없음 | 보안 패치 지연, 신규 기능 사용 불가 |
| B. NestJS 11 업그레이드 | 전체 @nestjs/* 패키지 v11 | Express v5, 최신 보안, CacheModule Keyv 지원 | 와일드카드 라우트 변경, JWT 타입 변경 |

## 결정

B안: NestJS 11로 업그레이드했다.

## 이유

CacheModule이 이미 Keyv 기반(`createKeyv()`)으로 구현되어 있어 가장 큰 breaking change가 이미 해결된 상태였다. 실제 수정이 필요했던 부분은 3곳뿐:
1. 미들웨어 와일드카드: `forRoutes('*')` → `forRoutes('*splat')` (Express v5 path-to-regexp 변경)
2. JWT `expiresIn` 타입: `string | number` → `number` (jwt v11 overload 변경)
3. passport-oauth2 `session` 속성: StrategyOptions 타입에서 제거됨

109개 테스트 전부 통과 확인 후 머지했다.

## 참고

- PR: #136
- [NestJS 11 Migration Guide](https://docs.nestjs.com/migration-guide)

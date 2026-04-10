# ALGOGO-34: 쿠키 설정 로직을 TokenCookieService로 추출

## 문제

auth-v2와 oauth-v2 컨트롤러에서 동일한 쿠키 설정 로직(httpOnly, secure, sameSite, maxAge)이 중복되어 있었다. 쿠키 옵션을 변경하면 두 곳을 동시에 수정해야 했다.

## 검토한 대안

| 대안 | 설명 | 장점 | 단점 |
|------|------|------|------|
| A. 유틸리티 함수 | 순수 함수로 쿠키 옵션 생성 | DI 불필요 | JwtConfig를 매번 인자로 전달해야 함 |
| B. jwt 모듈에 Service 추가 | TokenCookieService를 jwt 모듈에 등록 | DI로 config 자동 주입, 두 모듈 모두 JwtModule에 접근 가능 | jwt 모듈의 책임 범위가 넓어짐 |
| C. 별도 cookie 모듈 생성 | 독립 모듈로 분리 | 관심사 분리 깔끔 | 과도한 분리, 모듈 수 증가 |

## 결정

B안: jwt 모듈에 TokenCookieService를 추가했다.

## 이유

쿠키 설정은 JWT 토큰의 만료시간(jwtConfig)에 의존한다. jwt 모듈이 이미 두 컨트롤러 모듈에서 import되고 있어 추가 의존성이 없다. 별도 모듈을 만들면 config 하나 때문에 모듈이 늘어나는데, 현재 규모에서는 과하다.

## 참고

- PR: #129

# ALGOGO-35: process.env 직접 접근을 ConfigModule로 통일

## 문제

filter, service, adapter 등 여러 파일에서 `process.env.NODE_ENV`를 직접 읽고 있었다. 테스트에서 환경을 주입하기 어렵고, 환경 변수명이 변경되면 grep으로 찾아야 했다.

## 검토한 대안

| 대안 | 설명 | 장점 | 단점 |
|------|------|------|------|
| A. ConfigService.get() 직접 사용 | 각 파일에서 ConfigService 주입 | NestJS 기본 패턴 | 매번 문자열 키로 접근, 타입 안전성 없음 |
| B. registerAs + 타입 주입 | appConfig 생성 후 `@Inject(appConfig.KEY)` | 타입 안전, 자동완성 지원 | config 파일 하나 추가 |

## 결정

B안: `appConfig`를 `registerAs()`로 생성하고, 타입이 보장되는 주입 방식을 사용했다.

## 이유

프로젝트의 다른 config(jwtConfig, redisConfig 등)가 모두 `registerAs()` 패턴을 사용한다. 일관성을 유지하면서 `ConfigType<typeof appConfig>`로 타입 안전성을 확보했다. RedisIoAdapter는 NestJS DI 밖이므로 `app.get(redisConfig.KEY)`로 app context에서 가져왔다.

## 참고

- PR: #130

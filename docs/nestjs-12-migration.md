# NestJS 12 마이그레이션

Linear 이슈: ALGOGO-72. NestJS 11 기준 커밋 `672b9b1`의 서버를 NestJS 12.0.1로 이전한다. 원래 검토한 다섯 가지 기존 버그 수정과는 별도 작업이다. 실제 외부 서비스 검증과 남은 실패는 [OrbStack 검증 문서](orbstack-local.md)에 기록한다.

## 실행 환경

- Node **24.15.0**, pnpm **10.32.1**을 사용한다. `.nvmrc`와 `packageManager`가 기준이다.
- Nest 프레임워크와 연계 패키지를 호환되는 v12로 맞췄다. ConfigModule의 Standard Schema 검증을 위해 Joi 18을 사용하며 CLS·Prometheus 연동도 호환 버전으로 갱신했다.
- 출력은 CommonJS를 유지한다. NodeNext 해석, ES2023 대상, 명시적인 소스 루트와 전역 타입을 적용했다. 선택한 ESLint·ts-jest와 호환되도록 TypeScript는 6.0.x로 제한한다.
- Jest 30을 `--experimental-vm-modules`로 실행한다. ts-jest의 독립 파일 변환은 전체 타입 검사를 대신하지 않으므로 `typecheck`를 별도로 실행한다.
- Nest 12 지원을 선언하지 않는 nest-winston 대신 LoggerModule에서 Winston을 직접 제공한다. 주입 토큰·추적 메타데이터·로그 레벨·선택적 Loki 전송을 유지하며 콘솔 형식은 JSON으로 바뀐다.
- pnpm 10의 의존성 빌드 허용 목록을 명시했다. 기존 overrides를 적용하기 위해 지정된 패키지 매니저를 사용한다.

참고: [NestJS 공식 마이그레이션 가이드](https://docs.nestjs.com/migration-guide).

## 런타임 호환성 수정

- RedisService를 설정된 동적 모듈에서 한 번만 등록하고 종료 시 클라이언트 종료를 기다린다.
- Redis 옵션은 환경 파일의 비동기 검증이 완료된 뒤 주입된 redisConfig에서 읽는다. 모듈 선언 중 process.env를 캡처하면 Nest Config 12에서 환경 파일 전용 기동이 실패하므로 해당 경로를 별도로 검증한다.
- ExecuteService의 Queue·QueueEvents와 RedisIoAdapter가 소유한 pub/sub 클라이언트를 종료한다.
- 소켓 인증 DTO에 token 검증을 추가해 whitelist가 토큰을 제거하지 않도록 한다.
- sort DTO에 숫자 변환을 명시해 독립 파일 변환에서도 문자열 쿼리를 숫자로 처리한다.
- callable CommonJS 의존성은 default import, Express 전용 타입은 `import type`으로 바꾼다.
- 테스트 토큰 만료 시간을 운영 호출과 같이 명시한다.
- `start:prod`를 `dist/main.js`로 수정한다. Docker는 Node 24.15.0과 Prisma에 필요한 OpenSSL을 사용하고 `/metrics`로 상태를 검사한다.

## 설치와 기본 검증

```sh
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm install --frozen-lockfile --strict-peer-dependencies
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm run typecheck
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm test --runInBand
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm build
```

실제 DB·Redis·S3·컴파일러 검증은 [OrbStack 절차](orbstack-local.md)를 따른다. `test:nest12`는 빌드된 dist를 사용하며 별도 합성 worker로 전송 경로를 검증한다. 실제 컴파일러는 `test:local:services`로 검증한다. 두 경우 모두 빌드를 먼저 수행한다.

## 범위와 남은 문제

단위·타입 검사·빌드 통과만으로 모든 사용자 흐름이 정상이라고 주장하지 않는다. 전체 기존 E2E에는 NestJS 11에서도 재현되는 13개 실패가 있고, 실제 서비스 검증에는 S3 삭제와 소켓 실행 요청의 기존 오류 2개가 남아 있다. 실패를 숨기거나 테스트 기대값을 바꾸지 않았다.

Docker 이미지 빌드·기동, `/metrics` 200, 비인증 `/api/v1/me` 401, healthy 상태와 SIGTERM 후 10초 안 정상 종료를 확인했다. 실제 Google/Kakao 로그인과 외부 Loki/Tempo 전송은 검증하지 않았다.

별도 버그 수정 작업과 package.json·lockfile·Redis·실행 코드가 겹칠 수 있다. 두 작업을 통합할 때 양쪽 변경을 보존하고 관련 검증을 다시 수행한다.

## 독립 리뷰 후속 검증

환경 파일 전용 기동의 Redis 옵션 조기 캡처 회귀를 독립 리뷰에서 발견했다. `test:local:env-file`은 .test.env에 정의된 값을 부모 프로세스에서 제거한 새 프로세스를 실행해 Nest가 직접 파일을 읽도록 한다. 수정 전 Invalid URL 실패, 수정 후 서버 초기화·Redis 클라이언트 3개의 PING·정상 종료 통과를 확인했다. 이 테스트에는 `--env-file`을 붙이지 않는다.

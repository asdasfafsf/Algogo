# OrbStack 로컬 통합 검증

`algogo-nest12` Compose 프로젝트에 MySQL 8, Redis 7, MinIO, 실제 컴파일러와 NestJS 12 API를 띄운다. Mac에 공개하는 포트는 127.0.0.1에만 바인딩한다. 후속 검증을 위해 인스턴스를 실행 상태로 유지한다.

## 환경 준비

[마이그레이션 문서](nestjs-12-migration.md)의 Node 24.15.0과 pnpm 10.32.1을 사용한다.

```sh
rtk proxy docker compose -f compose.nest12.yml up -d --wait mysql redis minio
rtk proxy node test/prepare-local-infra.cjs
rtk proxy node --env-file=.test.env test/provision-local-db.cjs
rtk proxy docker compose -f compose.nest12.yml --profile compiler --profile api up -d --build compiler api
rtk proxy docker compose -f compose.nest12.yml ps
```

준비 스크립트는 할당된 포트·로컬 테스트 자격 증명·AES 테스트 키로 Git에서 제외된 `.test.env`를 다시 만든다. MinIO 버킷은 애플리케이션 이미지 URL 동작에 맞춰 공개 읽기를 설정한다. DB 준비 스크립트는 스키마와 기존 검색 코드가 요구하는 MySQL ngram 전문 검색 인덱스를 만든다.

컴파일러 소스는 `../algogo-compiler`를 읽는다. 다른 경로는 `ALGOGO_COMPILER_PATH`로 지정한다. Python·Node.js·GCC·Clang·OpenJDK 17을 포함하는 로컬 검증 이미지이며 운영 컴파일러 이미지를 대체하지 않는다. 컨테이너에 호스트 Docker 소켓이나 소스 디렉토리를 마운트하지 않는다.

API의 MinIO 주소는 `http://algogo-nest12-minio-1.orb.local:9000`이며 Mac에서도 이미지 URL을 열 수 있다. 콘솔은 같은 호스트의 9001 포트다. 로컬 계정은 `nest12-access` / `nest12-secret-local-only`다.

```sh
rtk proxy docker compose -f compose.nest12.yml port api 3000
```

API는 production 모드다. `/metrics`는 200, 비인증 `/api/v1/me`는 401이어야 한다. 이 모드에서는 Swagger UI가 비활성화된다.

## 테스트 재실행

DB 쓰기 테스트는 순서대로 실행한다. 기존 E2E가 테이블 데이터를 삭제하므로 이 프로젝트 전용 테스트 DB만 사용하고 다른 테스트와 동시에 실행하지 않는다.

```sh
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm build
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm run typecheck
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm test --runInBand
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm run test:local:e2e
rtk proxy npm exec --yes --package=pnpm@10.32.1 -- pnpm run test:local:services
```

`test:nest12`는 전용 `nest12-smoke-test` 큐의 합성 worker를 사용한다. `test:local:services`는 실제 컴파일러의 `execute` 큐와 MinIO를 사용하며 아래 기존 결함이 고쳐지기 전에는 실패한다.

## 검증 결과 — 2026-09-09

| 검증                | 결과                          |
| ------------------- | ----------------------------- |
| 전체 타입 검사·빌드 | 통과                          |
| 단위 테스트         | 22개 묶음, 175개 통과         |
| 기존 전체 E2E       | 110개 중 97개 통과, 13개 실패 |
| 실제 서비스 통합    | 14개 중 12개 통과, 2개 실패   |

Python·Node.js·C++·Clang·Java·Java17 모두 실제 큐와 소켓 진행 이벤트 경로에서 예상 출력 `42`를 확인했다. MinIO 업로드와 공개 HTTP 읽기도 통과했다.

실제 서비스 실패는 다음과 같다.

- S3Service.removeObject(url) 실행 후에도 객체 읽기가 200이다. URL에서 객체 키를 잘못 추출하는 기존 문제다.
- 유효한 execute 소켓 요청의 응답 코드가 9999다. 기존 RequestExecuteDto에 code·inputList 검증이 없어 whitelist가 실행에 필요한 값을 제거한다. 실행 Service에 직접 전달하는 실제 컴파일러 검증은 통과한다.

기존 E2E에서 실패한 다섯 묶음을 동일한 로컬 인프라와 명시적 테스트 토큰 만료 시간으로 NestJS 11 기준 커밋 `672b9b1`에서도 실행했다. 87개 중 74개 통과·동일한 13개 실패였다. 이전 버전은 연결 종료가 불완전해 테스트 프로세스 강제 종료 옵션이 필요했다. sort DTO의 명시적 숫자 변환과 회귀 테스트 두 개를 추가한 뒤 마이그레이션에서만 발생하는 E2E 실패는 남지 않았다.

| 기존 실패 영역   | 개수 | 관찰한 차이                                                       |
| ---------------- | ---: | ----------------------------------------------------------------- |
| 인증             |    1 | 같은 초 안의 refresh 요청이 동일한 토큰을 생성할 수 있음          |
| 코드             |    3 | 정상 템플릿 제목이 거부됨; 조회 테스트 둘에서 UUIDv7 fixture 거부 |
| 문제 검색        |    4 | 괄호형 배열 쿼리, 빈 결과, 잘못된 날짜 오류 메시지 기대값 차이    |
| OAuth 연결       |    2 | 활성·비활성 연결 재요청이 기대하는 성공 대신 409 반환             |
| 문제 사이트 계정 |    3 | 클래스 역할 제한 미적용, 삭제 요청 500                            |

실패 테스트를 숨기거나 통과하도록 기대값을 바꾸지 않았다. S3 삭제 오류는 별도 다섯 가지 개선 작업과 겹친다. 나머지 계약 차이도 검토가 필요하며 실제 Google/Kakao 로그인과 외부 Loki/Tempo 전송은 로컬 환경만으로 검증되지 않는다.

## 환경 종료

```sh
rtk proxy docker compose -f compose.nest12.yml --profile compiler --profile api stop
```

이 프로젝트의 데이터를 모두 초기화하려면 같은 Compose 프로젝트에 `down -v`를 적용한 뒤 환경 준비를 반복한다. 보존할 데이터가 없는 테스트 환경인지 확인한다.

수정한 TypeScript 파일의 ESLint 검사에서는 기존 app.module.ts의 require import와 OAuth 전략의 any·미사용 변수·불필요한 try/catch 오류 4개가 남는다. 이전한 LoggerModule의 require는 정적 import로 바꿔 해당 파일 검사를 통과했다. 따라서 전체 lint 통과로 보고하지 않는다.

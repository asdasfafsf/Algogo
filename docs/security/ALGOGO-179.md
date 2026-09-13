# ALGOGO-179 의존성 보안 수정

2026-09-13 GitHub Dependabot의 main 기준 열린 경고 90건을 취합했다. `pnpm-lock.yaml`의 모든 패키지 버전을 각 경고의 취약 범위와 비교했다. 쉼표 구분 비교식을 npm semver 형식으로 정규화하고 유효성 검사를 거친 결과, 수정된 lockfile에는 해당 취약 버전이 없다. pnpm 10.32.1 audit 역시 모든 심각도 0건이다. 경고를 dismiss하지 않는다.

## 변경 범위와 계약

- 인증된 프로필 업로드의 Multer → ImageService → Sharp 변환 계약을 유지한다. Multer 2.3, Sharp 0.35.4는 잘못된 multipart와 네이티브 이미지 디코더의 공개 취약점 패치를 포함한다.
- Google/Kakao OAuth의 고정 URL HTTP 요청은 Axios 1.20으로 갱신한다. 응답 크기 제한 우회는 로컬 HTTP 서버의 buffered/stream 응답으로 검사한다.
- 선택적으로 활성화하는 OpenTelemetry SDK, exporter, auto-instrumentations의 버전을 함께 올려 오래된 SDK/propagator/protobuf 의존성을 제거한다. 로컬 OTLP collector로 실제 span을 보내 호환성을 확인한다.
- AWS S3 SDK와 BullMQ는 현재 major 안에서 갱신하여 취약한 uuid 등 전이 의존성을 제거한다. BullMQ는 기존 ioredis 연결을 유지한다. Redis 5 선택적 peer 경고는 추가된 node-redis 어댑터용이며, 이 서비스는 Redis 4 인스턴스를 BullMQ에 넘기지 않는다.
- 고정된 취약 전이 의존성은 major 범위를 제한한 override로 패치한다. 기존 무제한 `>=` override도 검증한 major 안으로 제한한다.

## 검증

- `pnpm typecheck`, `pnpm build`, ESLint: 통과.
- `pnpm test --runInBand`: 29 suite, 196개 통과.
- `pnpm test:local:e2e`: 113개 통과.
- `pnpm test:security`: malformed/truncated multipart, 손상된 이미지 거부 후 정상 PNG→WebP, Axios 응답 크기 제한 및 정상 userinfo, OTLP span 전송 3개 통과. 먼저 `pnpm build`를 실행한다.
- 기존 로컬 smoke 및 환경 파일 검증: 6개 통과. 실제 서비스 연동: 수정된 컴파일러와 함께 Socket.IO/BullMQ/MinIO 및 6개 언어 실행 14개 통과.

개별 네이티브 libheif exploit 파일이나 모든 upstream 취약점 PoC를 재현한 것은 아니다. 공개된 취약 범위와 설치 버전 비교 및 독립 audit를 패키지 교체의 검증으로 사용하고, 애플리케이션이 사용하는 입력 경로를 추가 실행했다. Code scanning은 분석 내역이 없고 secret scanning은 비활성 상태였다. 이는 해당 검사에서 안전 판정을 받았다는 뜻이 아니다.

## 원본 경고 대조

| GitHub 경고 | 패키지 | 취약 범위 | 수정 lockfile 버전 |
|---|---|---|---|
| [#205](https://github.com/asdasfafsf/Algogo/security/dependabot/205) | `js-yaml` | `>= 4.0.0 < 4.3.2` | `3.15.2`, `4.3.2`, `5.4.1` |
| [#204](https://github.com/asdasfafsf/Algogo/security/dependabot/204) | `multer` | `< 2.3.0` | `2.3.0` |
| [#203](https://github.com/asdasfafsf/Algogo/security/dependabot/203) | `multer` | `< 2.3.0` | `2.3.0` |
| [#202](https://github.com/asdasfafsf/Algogo/security/dependabot/202) | `multer` | `< 2.3.0` | `2.3.0` |
| [#201](https://github.com/asdasfafsf/Algogo/security/dependabot/201) | `baseline-browser-mapping` | `>= 2.0.0 < 2.11.0` | `2.11.23` |
| [#200](https://github.com/asdasfafsf/Algogo/security/dependabot/200) | `sharp` | `< 0.35.4` | `0.35.4` |
| [#199](https://github.com/asdasfafsf/Algogo/security/dependabot/199) | `sharp` | `< 0.35.4` | `0.35.4` |
| [#198](https://github.com/asdasfafsf/Algogo/security/dependabot/198) | `joi` | `>= 17.2.0 < 17.13.6` | `18.2.8` |
| [#197](https://github.com/asdasfafsf/Algogo/security/dependabot/197) | `joi` | `>= 16.0.0 < 17.13.5` | `18.2.8` |
| [#196](https://github.com/asdasfafsf/Algogo/security/dependabot/196) | `qs` | `>= 2.2.5 < 6.16.0` | `6.16.0` |
| [#195](https://github.com/asdasfafsf/Algogo/security/dependabot/195) | `browserslist` | `<= 4.28.6` | `4.28.9` |
| [#193](https://github.com/asdasfafsf/Algogo/security/dependabot/193) | `@humanfs/node` | `< 0.16.8` | `0.16.8` |
| [#192](https://github.com/asdasfafsf/Algogo/security/dependabot/192) | `qs` | `>= 6.14.2 <= 6.15.3` | `6.16.0` |
| [#191](https://github.com/asdasfafsf/Algogo/security/dependabot/191) | `fast-uri` | `>= 3.0.0 < 3.1.6` | `3.1.7` |
| [#190](https://github.com/asdasfafsf/Algogo/security/dependabot/190) | `fast-uri` | `>= 3.0.0 < 3.1.6` | `3.1.7` |
| [#189](https://github.com/asdasfafsf/Algogo/security/dependabot/189) | `engine.io` | `>= 6.5.0 < 6.6.7` | `6.6.10` |
| [#188](https://github.com/asdasfafsf/Algogo/security/dependabot/188) | `fast-uri` | `>= 3.0.0 <= 3.1.0` | `3.1.7` |
| [#187](https://github.com/asdasfafsf/Algogo/security/dependabot/187) | `fast-uri` | `>= 3.0.0 <= 3.1.1` | `3.1.7` |
| [#186](https://github.com/asdasfafsf/Algogo/security/dependabot/186) | `js-yaml` | `>= 4.0.0 < 4.3.1` | `3.15.2`, `4.3.2`, `5.4.1` |
| [#185](https://github.com/asdasfafsf/Algogo/security/dependabot/185) | `socket.io-parser` | `>= 4.0.0 < 4.2.7` | `4.2.7` |
| [#184](https://github.com/asdasfafsf/Algogo/security/dependabot/184) | `fast-uri` | `>= 3.0.0 < 3.1.5` | `3.1.7` |
| [#181](https://github.com/asdasfafsf/Algogo/security/dependabot/181) | `js-yaml` | `>= 4.0.0 < 4.3.0` | `3.15.2`, `4.3.2`, `5.4.1` |
| [#180](https://github.com/asdasfafsf/Algogo/security/dependabot/180) | `axios` | `>= 1.0.0 < 1.18.0` | `1.20.0` |
| [#179](https://github.com/asdasfafsf/Algogo/security/dependabot/179) | `axios` | `>= 1.0.0 < 1.18.0` | `1.20.0` |
| [#178](https://github.com/asdasfafsf/Algogo/security/dependabot/178) | `axios` | `>= 1.0.0 < 1.18.0` | `1.20.0` |
| [#177](https://github.com/asdasfafsf/Algogo/security/dependabot/177) | `axios` | `>= 1.0.0 < 1.18.0` | `1.20.0` |
| [#176](https://github.com/asdasfafsf/Algogo/security/dependabot/176) | `axios` | `>= 1.7.0 < 1.18.0` | `1.20.0` |
| [#175](https://github.com/asdasfafsf/Algogo/security/dependabot/175) | `sharp` | `< 0.35.0` | `0.35.4` |
| [#174](https://github.com/asdasfafsf/Algogo/security/dependabot/174) | `sharp` | `< 0.35.0` | `0.35.4` |
| [#173](https://github.com/asdasfafsf/Algogo/security/dependabot/173) | `fast-uri` | `>= 3.0.0 <= 3.1.3` | `3.1.7` |
| [#172](https://github.com/asdasfafsf/Algogo/security/dependabot/172) | `fast-uri` | `>= 3.0.0 < 3.1.3` | `3.1.7` |
| [#171](https://github.com/asdasfafsf/Algogo/security/dependabot/171) | `@opentelemetry/propagator-jaeger` | `< 2.9.0` | `2.11.0` |
| [#170](https://github.com/asdasfafsf/Algogo/security/dependabot/170) | `axios` | `>= 1.13.0 < 1.18.0` | `1.20.0` |
| [#169](https://github.com/asdasfafsf/Algogo/security/dependabot/169) | `body-parser` | `>= 2.0.0 < 2.3.0` | `2.3.0` |
| [#168](https://github.com/asdasfafsf/Algogo/security/dependabot/168) | `engine.io` | `>= 4.1.0 < 6.6.7` | `6.6.10` |
| [#167](https://github.com/asdasfafsf/Algogo/security/dependabot/167) | `axios` | `>= 1.15.0 < 1.18.0` | `1.20.0` |
| [#166](https://github.com/asdasfafsf/Algogo/security/dependabot/166) | `protobufjs` | `>= 7.5.0 <= 7.6.4` | `7.6.6` |
| [#165](https://github.com/asdasfafsf/Algogo/security/dependabot/165) | `brace-expansion` | `>= 3.0.0 < 5.0.7` | `1.1.18`, `2.1.4`, `5.0.9` |
| [#164](https://github.com/asdasfafsf/Algogo/security/dependabot/164) | `axios` | `>= 1.15.0 < 1.16.0` | `1.20.0` |
| [#163](https://github.com/asdasfafsf/Algogo/security/dependabot/163) | `js-yaml` | `>= 4.0.0 <= 4.1.1` | `3.15.2`, `4.3.2`, `5.4.1` |
| [#162](https://github.com/asdasfafsf/Algogo/security/dependabot/162) | `@babel/core` | `<= 7.29.0` | `7.29.7` |
| [#160](https://github.com/asdasfafsf/Algogo/security/dependabot/160) | `axios` | `>= 1.0.0 < 1.16.0` | `1.20.0` |
| [#159](https://github.com/asdasfafsf/Algogo/security/dependabot/159) | `form-data` | `>= 4.0.0 < 4.0.6` | `4.0.6` |
| [#157](https://github.com/asdasfafsf/Algogo/security/dependabot/157) | `multer` | `>= 1.0.0 < 2.2.0` | `2.3.0` |
| [#156](https://github.com/asdasfafsf/Algogo/security/dependabot/156) | `multer` | `>= 2.0.0-alpha.1 < 2.2.0` | `2.3.0` |
| [#155](https://github.com/asdasfafsf/Algogo/security/dependabot/155) | `protobufjs` | `<= 7.6.0` | `7.6.6` |
| [#154](https://github.com/asdasfafsf/Algogo/security/dependabot/154) | `protobufjs` | `<= 7.6.2` | `7.6.6` |
| [#153](https://github.com/asdasfafsf/Algogo/security/dependabot/153) | `@opentelemetry/core` | `< 2.8.0` | `2.11.0` |
| [#152](https://github.com/asdasfafsf/Algogo/security/dependabot/152) | `joi` | `< 17.13.4` | `18.2.8` |
| [#151](https://github.com/asdasfafsf/Algogo/security/dependabot/151) | `axios` | `>= 1.0.0 < 1.16.0` | `1.20.0` |
| [#148](https://github.com/asdasfafsf/Algogo/security/dependabot/148) | `@grpc/grpc-js` | `>= 1.14.0 < 1.14.4` | `1.14.4` |
| [#147](https://github.com/asdasfafsf/Algogo/security/dependabot/147) | `@grpc/grpc-js` | `>= 1.14.0 < 1.14.4` | `1.14.4` |
| [#146](https://github.com/asdasfafsf/Algogo/security/dependabot/146) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#144](https://github.com/asdasfafsf/Algogo/security/dependabot/144) | `axios` | `>= 1.0.0 < 1.15.2` | `1.20.0` |
| [#143](https://github.com/asdasfafsf/Algogo/security/dependabot/143) | `axios` | `>= 1.0.0 < 1.16.0` | `1.20.0` |
| [#142](https://github.com/asdasfafsf/Algogo/security/dependabot/142) | `axios` | `>= 1.0.0 < 1.16.0` | `1.20.0` |
| [#141](https://github.com/asdasfafsf/Algogo/security/dependabot/141) | `axios` | `>= 1.0.0 < 1.16.0` | `1.20.0` |
| [#140](https://github.com/asdasfafsf/Algogo/security/dependabot/140) | `axios` | `>= 1.7.0 < 1.16.0` | `1.20.0` |
| [#139](https://github.com/asdasfafsf/Algogo/security/dependabot/139) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#138](https://github.com/asdasfafsf/Algogo/security/dependabot/138) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#137](https://github.com/asdasfafsf/Algogo/security/dependabot/137) | `protobufjs` | `<= 7.5.7` | `7.6.6` |
| [#135](https://github.com/asdasfafsf/Algogo/security/dependabot/135) | `uuid` | `< 11.1.1` | 의존성 제거 |
| [#134](https://github.com/asdasfafsf/Algogo/security/dependabot/134) | `qs` | `>= 6.11.1 <= 6.15.1` | `6.16.0` |
| [#132](https://github.com/asdasfafsf/Algogo/security/dependabot/132) | `axios` | `>= 1.0.0 < 1.15.2` | `1.20.0` |
| [#131](https://github.com/asdasfafsf/Algogo/security/dependabot/131) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#130](https://github.com/asdasfafsf/Algogo/security/dependabot/130) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#129](https://github.com/asdasfafsf/Algogo/security/dependabot/129) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#128](https://github.com/asdasfafsf/Algogo/security/dependabot/128) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#127](https://github.com/asdasfafsf/Algogo/security/dependabot/127) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#126](https://github.com/asdasfafsf/Algogo/security/dependabot/126) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#125](https://github.com/asdasfafsf/Algogo/security/dependabot/125) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#124](https://github.com/asdasfafsf/Algogo/security/dependabot/124) | `protobufjs` | `<= 7.5.5` | `7.6.6` |
| [#123](https://github.com/asdasfafsf/Algogo/security/dependabot/123) | `@protobufjs/utf8` | `<= 1.1.0` | `1.1.2` |
| [#122](https://github.com/asdasfafsf/Algogo/security/dependabot/122) | `@opentelemetry/sdk-node` | `< 0.217.0` | `0.222.0` |
| [#121](https://github.com/asdasfafsf/Algogo/security/dependabot/121) | `@opentelemetry/sdk-node` | `< 0.217.0` | `0.222.0` |
| [#120](https://github.com/asdasfafsf/Algogo/security/dependabot/120) | `@opentelemetry/auto-instrumentations-node` | `< 0.75.0` | `0.80.0` |
| [#119](https://github.com/asdasfafsf/Algogo/security/dependabot/119) | `@opentelemetry/auto-instrumentations-node` | `< 0.75.0` | `0.80.0` |
| [#118](https://github.com/asdasfafsf/Algogo/security/dependabot/118) | `@opentelemetry/exporter-prometheus` | `< 0.217.0` | `0.222.0` |
| [#115](https://github.com/asdasfafsf/Algogo/security/dependabot/115) | `fast-xml-builder` | `<= 1.1.6` | 의존성 제거 |
| [#114](https://github.com/asdasfafsf/Algogo/security/dependabot/114) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#113](https://github.com/asdasfafsf/Algogo/security/dependabot/113) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#112](https://github.com/asdasfafsf/Algogo/security/dependabot/112) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#111](https://github.com/asdasfafsf/Algogo/security/dependabot/111) | `axios` | `>= 1.0.0 < 1.15.2` | `1.20.0` |
| [#110](https://github.com/asdasfafsf/Algogo/security/dependabot/110) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#109](https://github.com/asdasfafsf/Algogo/security/dependabot/109) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#108](https://github.com/asdasfafsf/Algogo/security/dependabot/108) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#107](https://github.com/asdasfafsf/Algogo/security/dependabot/107) | `axios` | `>= 1.0.0 < 1.15.1` | `1.20.0` |
| [#105](https://github.com/asdasfafsf/Algogo/security/dependabot/105) | `fast-xml-parser` | `< 5.7.0` | 의존성 제거 |
| [#104](https://github.com/asdasfafsf/Algogo/security/dependabot/104) | `protobufjs` | `< 7.5.5` | `7.6.6` |
| [#103](https://github.com/asdasfafsf/Algogo/security/dependabot/103) | `follow-redirects` | `<= 1.15.11` | `1.16.0` |

## 최종 검토

사전 의존성·호환성 조사는 별도 읽기 전용 에이전트가 수행했다. 수정 후 독립 리뷰 에이전트는 보안 요청 자동 필터로 실행을 완료하지 못했다. 독립 리뷰 통과로 간주하지 않고 담당자가 별도 읽기 전용 검토로 대체했다. 변경된 의존성의 직접 소비 경로, Node/CommonJS 호환성, queue 연결·응답 계약, 잠금 파일의 중복 버전을 다시 대조했다. 추가로 확인된 회귀는 없었다.

# ALGOGO-176: Pino 기반 구조화 로깅

## 문제

기존 Winston 구성은 애플리케이션 로그와 HTTP 접근 로그를 JSON으로 출력하고 Loki로 직접 전송한다. 로거를 교체하면서 이 계약과 CLS 추적 정보를 유지해야 하며, HTTP 로깅 프레임워크를 추가하면 기존 인터셉터와 로그가 중복될 수 있다.

## 검토한 대안

| 대안               | 설명                                                         | 장점                                               | 단점                                                        |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------- |
| Winston 유지       | 현재 구성과 전송 계층을 계속 사용                            | 변경이 가장 작음                                   | 요청된 로거 현대화를 충족하지 못함                          |
| `nestjs-pino` 도입 | Nest 통합 모듈과 자동 HTTP 로깅 사용                         | Nest 부트스트랩 통합이 편리함                      | 기존 접근 로그 인터셉터와 책임이 겹치고 로그 계약 변경이 큼 |
| Pino 직접 구성     | 기존 `AppLogger`와 인터셉터 뒤에서 Pino와 `pino-loki`를 사용 | 호출부와 CLS 계약을 유지하고 전송 계층만 교체 가능 | 수명주기와 접근 로그 완료 시점을 직접 관리해야 함           |

## 결정

Pino를 직접 구성하고 기존 `AppLogger`와 접근 로그 인터셉터를 유지한다.

구조화 로그의 애플리케이션 필드와 `requestId`, `traceId`, `context`는 유지하지만 Pino의 기본 JSON 스키마를 따른다. 이에 따라 Winston의 문자열 `level`, `message`, `timestamp`는 각각 숫자 `level`, `msg`, ISO 문자열 `time`으로 바뀐다. stdout 또는 Loki 로그를 파싱하는 소비자는 이 필드명을 기준으로 쿼리와 파서를 갱신해야 한다.

## 이유

현재 로깅 경계가 이미 한곳에 모여 있어 Nest 통합 모듈의 자동 HTTP 로깅을 더하면 같은 요청이 중복 기록된다. 직접 구성하면 호출부를 바꾸지 않고 stdout JSON과 Loki worker transport를 함께 사용할 수 있다. Loki 전송은 종료 시 worker가 확실히 닫히도록 배치하지 않고, 애플리케이션 종료 시 flush와 transport 종료를 명시한다. 접근 로그는 응답 `finish` 시점의 최종 상태 코드를 기록한다.

## 참고

- Linear: ALGOGO-176
- Pino 문서: https://github.com/pinojs/pino/tree/main/docs
- pino-loki 문서: https://github.com/Julien-R44/pino-loki

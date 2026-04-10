---
paths:
  - "src/**/*.ts"
  - "test/**/*.ts"
  - "tsconfig.json"
  - "eslint.config.mjs"
---

# TypeScript / NestJS 코딩 규칙

TypeScript 코드를 작성할 때 반드시 따르는 규칙.
Effective TypeScript (2nd ed.), NestJS 공식 가이드, 일반 백엔드 원칙 기반.

## 규칙 강도

- **MUST**: 반드시 지킨다. 규칙 본문에 명시된 허용 범위 내에서만 예외를 인정한다.
- **SHOULD**: 원칙적으로 지킨다. 명확한 이유가 있을 때만 예외 허용.
- **MAY**: 권장. 상황에 따라 판단.

## 적용 범위

- **신규 코드**: 모든 규칙을 즉시 적용한다.
- **기존 코드**: 해당 파일을 수정할 때 함께 정리한다. 규칙 적용만을 위한 일괄 리팩토링은 별도 이슈로 관리한다.

## 최상위 원칙

두 규칙이 충돌하면 아래 순서로 판단한다:

0. **타입 안전성이 최우선** — 이 프로젝트에서 가장 중요한 원칙이다. `any`를 허용하지 않고, strict 모드를 유지하며, 타입으로 불가능한 상태를 표현할 수 없게 만든다. Effective TypeScript의 모든 원칙을 적극 따른다
1. **프로젝트 적합성** — 일반 관행보다 이 프로젝트의 구조와 원칙에 맞는 것을 선택한다. 코드만으로 드러나지 않는 "왜"가 있으면 ADR에 기록한다
2. **변경 비용으로 측정하라** — 깨끗해 보이지만 수정에 이틀 걸리는 코드는 클린 코드가 아니다
3. **쉽고 간단하게** — 복잡한 패턴보다 읽기 쉬운 코드
4. **필요한 것만** — YAGNI. 미래를 위한 코드를 만들지 않음
5. **계층을 지킨다** — Controller → Service → Repository 방향만 허용. 역방향 의존 금지

---

## 1. 타입 시스템

> `strict: true`, `no-explicit-any: error`는 tsconfig.json / .eslintrc.js로 강제된다. 이 섹션은 린터가 잡지 못하는 설계 수준의 타입 규칙만 다룬다.

### 타입을 변경하기 전에 데이터 흐름을 끝까지 추적한다 (MUST)

타입, 파라미터, DTO, 반환값을 변경할 때는 반드시 해당 값의 전체 흐름을 추적한다. **출발지 → 변환 → 도착지**를 모두 확인한 뒤에 변경한다.

확인 대상:
- **DB 스키마** — Prisma schema에서 해당 컬럼의 실제 타입 (`Int`, `String`, `DateTime` 등)
- **외부 API 계약** — 서드파티 응답 형태, OAuth 프로바이더 반환 필드
- **미들웨어/가드/인터셉터 파이프라인** — `req`에 값을 세팅하는 주체가 누구인지
- **프론트엔드 계약** — 클라이언트가 기대하는 응답 형태
- **다른 서비스/모듈의 호출부** — 이 타입을 참조하는 모든 곳

```
나쁜 예:
  1. DTO 필드 타입을 number → string으로 변경
     → DB 컬럼은 INT, 다른 서비스도 number로 기대 → 런타임 불일치
  2. 함수 반환 타입을 바꿨는데 호출하는 쪽을 확인 안 함
     → 10곳에서 이전 타입 기준으로 분기하고 있었음
  3. 인터페이스에 optional(?) 추가
     → 하위 구현체가 필수로 의존하고 있었음

좋은 예:
  1. 변경할 타입의 값이 어디서 생성되는지 확인 (미들웨어? DB? 외부 API?)
  2. 그 값이 어떤 레이어를 거쳐 어디까지 흘러가는지 추적
  3. 최종 도착지(DB 저장, API 응답, 다른 서비스 호출)에서 기대하는 타입 확인
  4. 전체 체인이 일관되는 것을 확인한 뒤에만 변경
```

**흐름을 끝까지 추적할 수 없으면 변경하지 않는다.** 컴파일이 통과해도 런타임에 깨질 수 있다. 먼저 조사하고, 이해한 뒤에 변경한다.

### 타입 추론을 활용한다 (SHOULD)

타입이 명백히 추론되면 명시하지 않는다.

```typescript
// 좋은 예
const name = 'hello';
const count = items.length;

// 나쁜 예
const name: string = 'hello';
```

### 반환 타입 명시 (SHOULD)

public 메서드는 반환 타입을 명시한다. private 메서드는 추론에 맡겨도 된다 (MAY).

```typescript
async findUser({ userUuid }: { userUuid: string }): Promise<User | null> {
  return this.prismaService.user.findUnique({ where: { uuid: userUuid } });
}
```

### 타입 좁히기를 활용한다 (MUST)

`typeof`, `instanceof`, `in`, 판별 유니온, 사용자 정의 타입 가드를 사용하여 타입을 좁힌다.

```typescript
// typeof
if (typeof value === 'string') { ... }

// instanceof
if (error instanceof CustomHttpException) { ... }

// 판별 유니온
type Result = { success: true; data: User } | { success: false; error: string };
function handle(result: Result) {
  if (result.success) {
    // result.data 접근 가능
  }
}

// 사용자 정의 타입 가드
function isValidState(value: string): value is ProblemState {
  return ['SOLVED', 'ATTEMPTED', 'DEFAULT'].includes(value);
}
```

### 유효한 상태만 표현하는 타입을 설계한다 (MUST)

불가능한 상태를 타입 레벨에서 배제한다. 유니온 타입과 판별 필드를 활용한다.

```typescript
// 나쁜 예 — isLoading과 error가 동시에 true일 수 있음
interface State {
  isLoading: boolean;
  error: string | null;
  data: Result | null;
}

// 좋은 예 — 판별 유니온
type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: Result };
```

### 타입 단언보다 타입 선언을 사용한다 (MUST)

`as`는 타입 체커를 우회한다. 타입 선언(`: Type`)이나 타입 가드를 사용한다.

```typescript
// 나쁜 예
const user = response as User;

// 좋은 예 — 타입 선언
const user: User = response;

// 좋은 예 — 타입 가드
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'uuid' in value;
}
```

**허용 예외:**
- `as const`
- 테스트에서 mock 객체: `as jest.Mocked<T>`
- Prisma 반환값의 도메인 타입 변환: `user.state as UserState` (Prisma가 `string`으로 반환하는 경우)

### 타입과 인터페이스의 구분 (SHOULD)

- **interface**: 클래스가 구현하거나, 확장 가능성이 있는 객체 형태
- **type**: 유니온, 인터섹션, 매핑, 유틸리티 타입 조합

```typescript
// interface — 확장 가능한 객체 계약
interface TokenUser {
  sub: string;
  roles: string[];
}

// type — 유니온, 조합
type ProblemState = 'SOLVED' | 'ATTEMPTED' | 'DEFAULT';
type WithPagination<T> = T & { total: number; pageNo: number };
```

### enum 대신 as const 객체를 사용한다 (MUST)

TypeScript enum은 트리쉐이킹 문제와 런타임 코드 생성 이슈가 있다. `as const` 객체를 선호한다.

```typescript
// 좋은 예
export const USER_STATE = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type UserState = (typeof USER_STATE)[keyof typeof USER_STATE];

// 나쁜 예
enum UserState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  WITHDRAWN = 'WITHDRAWN',
}
```

---

## 2. 설계 원칙

### 3레이어 아키텍처 (MUST)

```
Controller → Service → Repository
```

- **Controller**: HTTP 요청/응답 처리만. 비즈니스 로직 없음. 가드, 데코레이터로 인증/검증 위임. 매개변수 파싱과 서비스 호출, 응답 반환만 수행한다.
- **Service**: 비즈니스 로직. 트랜잭션 경계. 예외 발생. 유스케이스를 오케스트레이션한다.
- **Repository**: 데이터 접근. Prisma 쿼리. SQL 변환. 예외를 던지지 않는다.

역방향 의존(Repository → Service, Service → Controller)은 금지한다.

```typescript
// 좋은 예 — Controller는 위임만
@Post(':id/approve')
approve(@Param('id') id: string, @User() user: TokenUser) {
  return this.usersService.approveUser({ id, approvedBy: user.sub });
}

// 나쁜 예 — Controller에 비즈니스 로직
@Post(':id/approve')
async approve(@Param('id') id: string) {
  const user = await this.usersService.findById(id);
  if (!user) throw new NotFoundException();
  if (user.status !== 'PENDING') throw new BadRequestException();
  await this.usersService.updateStatus(id, 'APPROVED');
  return { ok: true };
}
```

### 하나의 모듈 = 하나의 비즈니스 도메인 (MUST)

- 하나의 모듈은 하나의 비즈니스 도메인을 담당한다.
- 관련 없는 기능을 하나의 모듈에 섞지 않는다.
- Service가 비대해지면 도메인별로 분리한다.
- 다른 모듈은 export된 Service를 통해서만 접근한다. 내부 provider에 직접 의존하지 않는다.

### 비즈니스 규칙은 한 곳에 (SHOULD)

비즈니스 규칙이 Controller, Service, Repository, Guard, Helper에 분산되면 유지보수가 어려워진다. 규칙은 Service에 집중시킨다.

### 의존성 주입 (MUST)

- 생성자 주입만 사용한다.
- `private readonly`로 선언한다.
- 직접 인스턴스 생성(`new Service()`)하지 않는다.

```typescript
constructor(
  private readonly usersRepository: UsersRepository,
  private readonly jwtService: JwtService,
) {}
```

### 불변성 선호 (SHOULD)

- `const`를 기본으로 사용한다. `let`은 재할당이 필요한 경우에만.
- `var`는 사용하지 않는다 (MUST).
- 객체/배열을 수정하지 말고 새로 만든다. 단, 성능이 중요한 루프 내에서는 가변 허용.
- `readonly`를 적극 활용한다.

---

## 3. 모듈 구조

### 디렉토리 구성 (MUST)

```
src/{module-name}/
├── {module-name}.module.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
├── {module-name}.repository.ts
├── {module-name}.service.spec.ts
├── constants.ts                    (선택)
├── errors/                         (선택)
│   └── {Domain}Exception.ts
├── types/                          (선택)
│   └── {name}.type.ts
└── dto/
    ├── {용도}-{대상}.dto.ts         (신규)
    └── {Legacy}Dto.ts              (기존 PascalCase 허용)
```

- 신규 DTO 파일은 kebab-case를 사용한다.
- 기존 PascalCase DTO 파일은 수정 시 점진적으로 kebab-case로 변환한다.

### 모듈 등록 (MUST)

- `providers`에 Service와 Repository를 등록한다.
- 다른 모듈에서 사용하는 Service만 `exports`한다.
- Repository는 모듈 외부로 노출하지 않는다.

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

### 순환 의존 금지 (MUST)

모듈 간 순환 의존이 발생하면 설계가 잘못된 것이다. `forwardRef()`로 우회하지 않는다.

#### 순환이 생기는 패턴과 해결

| 패턴 | 원인 | 해결 |
|------|------|------|
| A.Service → B.Service → A.Service | 두 서비스가 서로 호출 | 공통 로직을 C 모듈로 추출. A→C, B→C |
| A.Module imports B, B imports A | 모듈 간 양방향 의존 | 한쪽 의존을 이벤트로 전환하거나 공통 모듈 추출 |
| Service → Repository → Service | Repository가 Service를 참조 | Repository는 Service를 모른다. 역방향 금지 |

#### 설계 원칙

1. **의존 방향은 단방향** — 상위 모듈이 하위 모듈을 import. 역방향 금지
2. **두 모듈이 서로 필요하면 제3의 모듈로 추출** — 공유 로직을 별도 모듈에 둔다
3. **이벤트로 역방향 통신** — A가 B를 호출해야 하는데 B가 이미 A에 의존하면, A는 이벤트를 발행하고 B가 구독한다 (EventEmitter2)
4. **인터페이스로 의존성 역전** — 구현이 아닌 인터페이스에 의존. 단, 현재 규모에서는 과도할 수 있으므로 필요 시 적용

### shared/common은 쓰레기통이 아니다 (SHOULD)

`common/` 디렉토리에는 진정으로 범용적이고 안정적인 코드만 둔다. 자주 변경되는 코드는 공유가 아니라 소유권이 불명확한 것이다. 특정 모듈에만 관련된 코드를 `common/`에 넣지 않는다.

---

## 4. 에러 처리

### 커스텀 예외 계층을 사용한다 (MUST)

NestJS 빌트인 예외(`NotFoundException`, `BadRequestException`)를 직접 던지지 않는다. 프로젝트 예외 계층을 사용한다.

```
CustomHttpException (base, extends HttpException)
├── CustomNotFoundException (404)
│   ├── UserNotFoundException
│   ├── ProblemNotFoundException
│   └── ...도메인별 Not Found
├── CustomUnauthorizedException (401)
├── CustomForbiddenException (403)
├── CustomConflictException (409)
└── CustomTooManyRequestsException (429)
```

### 에러 전략 통일 (MUST)

하나의 에러 전략을 사용한다. 에러 형식이 모듈마다 다르면 안 된다.

- 모든 도메인 예외는 `CustomHttpException` 계층을 상속한다.
- `AllExceptionsFilter`가 일관된 응답 형식(`{ statusCode, errorCode, errorMessage }`)을 보장한다.
- 에러 코드(`code`)와 메시지(`message`)를 반드시 포함한다.

### 예외 생성 규칙 (MUST)

- 에러 코드는 `DOMAIN_ACTION` 형태 UPPER_SNAKE_CASE: `USER_NOT_FOUND`, `TOKEN_EXPIRED`, `PROBLEM_SITE_NOT_FOUND`
- 에러 메시지는 한글로 작성한다.
- 도메인별 예외는 매개변수 없는 생성자를 사용한다.
- 예외 파일명: `{Domain}{Exception}.ts` PascalCase (예: `UserNotFoundException.ts`)

```typescript
export class UserNotFoundException extends CustomNotFoundException {
  constructor() {
    super({
      code: 'USER_NOT_FOUND',
      message: '회원이 존재하지 않습니다.',
    });
  }
}
```

### 예외 발생 위치 (SHOULD)

- **Service**에서 비즈니스 예외를 던진다.
- **Repository**는 예외를 던지지 않는다. `null`을 반환하고 Service가 판단한다.
- **Controller**는 예외를 던지지 않는다. Service에 위임한다.
- **Guard/Pipe**는 인증/검증 예외만 던진다.

### 에러를 무시하지 않는다 (MUST)

catch한 에러를 삼키지 않는다. 로깅하거나 변환하여 다시 던진다.

```typescript
// 나쁜 예
try { await riskyOperation(); } catch (e) { /* 무시 */ }

// 좋은 예
try {
  await riskyOperation();
} catch (error: unknown) {
  this.logger.error('Operation failed', { error });
  throw new CustomHttpException(
    { code: 'OPERATION_FAILED', message: '작업 처리에 실패했습니다.' },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
```

---

## 5. 함수와 메서드

### 매개변수 객체 패턴 (SHOULD)

매개변수가 2개 이상이면 객체로 받는다. 단일 매개변수는 의미가 명확하면 직접 전달을 허용한다.

```typescript
// 좋은 예 — 2개 이상은 객체
async findUser({ userUuid }: { userUuid: string }) { ... }
async saveRefreshToken({ userUuid, refreshToken }: { userUuid: string; refreshToken: string }) { ... }

// 좋은 예 — DTO로 받기
async getProblemsSummary(dto: InquiryProblemsSummaryDto) { ... }

// 허용 — 단일 매개변수가 명확한 경우
async getMe(uuid: string) { ... }

// 나쁜 예 — 2개 이상을 나열
async saveRefreshToken(userUuid: string, refreshToken: string) { ... }
```

### 함수 크기 (SHOULD)

- 하나의 함수는 하나의 일만 한다.
- 크기보다 응집도가 기준이다. 하나의 논리적 흐름이면 길어도 괜찮다.

### Early Return (SHOULD)

- 에러/예외를 먼저 검사하고 반환한다.
- `if` 블록이 `return`/`throw`로 끝나면 `else`를 쓰지 않는다.

```typescript
// 좋은 예
if (!user) {
  throw new UserNotFoundException();
}
return user;

// 나쁜 예
if (user) {
  return user;
} else {
  throw new UserNotFoundException();
}
```

### async/await (MUST)

- Promise를 반환하는 함수는 `async/await`를 사용한다.
- `.then()/.catch()` 체이닝을 사용하지 않는다. 단, `Promise.all()` 등 병렬 실행은 허용.
- 불필요한 `await`를 사용하지 않는다. 마지막 return에서 단일 Promise를 반환할 때는 `await` 없이 반환한다. 단, try-catch 블록 안에서는 반드시 `await`한다.

```typescript
// 좋은 예 — try-catch 밖 마지막 return
async findUser({ userUuid }: { userUuid: string }) {
  return this.usersRepository.findUser({ userUuid });
}

// 좋은 예 — try-catch 안에서는 await 필수
async findUser({ userUuid }: { userUuid: string }) {
  try {
    return await this.usersRepository.findUser({ userUuid });
  } catch (error: unknown) {
    throw new UserNotFoundException();
  }
}
```

---

## 6. 클래스

### NestJS 데코레이터 (MUST)

- Controller: `@Controller('{path}')`
- Service: `@Injectable()`
- Repository: `@Injectable()`
- Module: `@Module({ ... })`
- Gateway (WebSocket): `@WebSocketGateway()`

### 멤버 순서 (SHOULD)

```typescript
class UsersService {
  // 1. static 필드
  // 2. 인스턴스 필드
  // 3. constructor
  // 4. public 메서드
  // 5. private 메서드
}
```

### 접근 제어자 (SHOULD)

- 외부에서 호출하는 메서드만 `public` (생략 가능).
- 클래스 내부에서만 쓰는 메서드는 `private`.
- 주입받은 의존성은 `private readonly`.

---

## 7. DTO와 검증

### 경계에서 검증한다 (MUST)

모든 외부 입력은 HTTP 경계에서 DTO + `class-validator`로 즉시 검증한다. "나중에 검증하겠다"는 "검증하지 않겠다"와 같다.

- `class-validator` 데코레이터로 검증한다.
- `class-transformer` `@Transform()`으로 타입 변환한다.
- `@ApiProperty()`로 Swagger 문서화한다.
- 검증 메시지는 한글로 작성한다.
- Global `ValidationPipe`(`transform: true`, `whitelist: true`)을 신뢰하되, 비즈니스 규칙 검증은 Service에서 수행한다.

```typescript
export class InquiryProblemsSummaryDto {
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: '페이지 번호는 숫자만 입력할 수 있습니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  @ApiProperty({ description: '페이지 번호', example: 1 })
  pageNo?: number = 1;
}
```

### DTO 프로퍼티 `!` (definite assignment assertion) (MUST)

DTO 프로퍼티에 `!`를 사용한다. class-validator/class-transformer가 런타임에 요청 body에서 값을 주입하므로 생성자에서 초기화하지 않는다. strict 모드에서 TypeScript가 초기화를 요구하기 때문에 `!`로 "런타임에 할당됨"을 명시한다.

```typescript
export class CreateUserDto {
  @IsString()
  @ApiProperty({ description: '이름' })
  name!: string;  // class-transformer가 런타임에 할당

  @IsOptional()
  @ApiProperty({ required: false })
  nickname?: string;  // optional은 ?를 사용
}
```

- 필수 필드: `!` 사용 (`name!: string`)
- 선택 필드: `?` 사용 (`nickname?: string`)
- 기본값이 있는 필드: 초기화로 해결 (`pageNo?: number = 1`)

### Response DTO (SHOULD)

- `@ApiProperty()`로 Swagger 문서화한다.
- 내부 데이터 구조를 외부에 노출하지 않는다.
- Repository 결과를 그대로 반환하지 말고 DTO로 변환한다.

### DTO 파일 위치 (MUST)

모듈 내 `dto/` 디렉토리에 둔다.

---

## 8. Repository

### Prisma 직접 사용 (MUST)

Repository에서 PrismaService를 직접 사용한다. 추가 추상화 레이어를 두지 않는다.

### select 명시 (SHOULD)

필요한 필드만 `select`로 명시한다. `select` 없이 전체 필드를 가져오지 않는다.

```typescript
// 좋은 예
const user = await this.prismaService.user.findUnique({
  select: { uuid: true, name: true, email: true },
  where: { uuid: userUuid },
});

// 나쁜 예 — 전체 필드 반환
const user = await this.prismaService.user.findUnique({
  where: { uuid: userUuid },
});
```

### null 반환 (MUST)

Repository는 데이터가 없을 때 예외를 던지지 않고 `null`을 반환한다. 존재 여부 판단은 Service의 책임이다.

### Raw SQL (SHOULD)

- Prisma 쿼리 빌더로 표현할 수 없는 복잡한 쿼리에만 `$queryRaw`를 사용한다.
- SQL injection을 방지하기 위해 반드시 `Prisma.sql` 태그드 템플릿을 사용한다.
- `$queryRawUnsafe`에 문자열 보간으로 SQL을 조합하지 않는다 (MUST).

### 트랜잭션 (SHOULD)

- 여러 쓰기 작업이 원자적이어야 할 때 Prisma `$transaction()`을 사용한다.
- 트랜잭션 경계는 Service에서 결정한다.
- `@Transaction()` 데코레이터를 사용하는 경우, 데코레이터가 Repository의 PrismaService를 트랜잭션 클라이언트로 교체하는 동작을 이해한 상태에서 사용한다.

```typescript
// Service에서 트랜잭션 경계 결정
@Transaction()
async transferPoints({ fromUuid, toUuid, amount }: TransferDto) {
  await this.pointsRepository.deduct({ userUuid: fromUuid, amount });
  await this.pointsRepository.add({ userUuid: toUuid, amount });
}
```

---

## 9. 네이밍

### 파일명 (MUST)

kebab-case. NestJS 컨벤션을 따른다.

```
{name}.controller.ts
{name}.service.ts
{name}.repository.ts
{name}.module.ts
{name}.guard.ts
{name}.decorator.ts
{name}.filter.ts
{name}.pipe.ts
{name}.gateway.ts
{name}.spec.ts
{name}.type.ts
{name}.constant.ts
```

DTO 신규: `{용도}-{대상}.dto.ts` (예: `inquiry-problems-summary.dto.ts`)
예외: `{Domain}{Exception}.ts` PascalCase (예: `UserNotFoundException.ts`)
모듈 내 상수: `constants.ts`
공유 상수: `{domain}.constant.ts` (예: `user.constant.ts`)

### 클래스명 (MUST)

PascalCase. 접미사로 역할을 나타낸다.

```typescript
UsersService          // Service
UsersRepository       // Repository
UsersController       // Controller
UsersModule           // Module
AuthGuard             // Guard
UserNotFoundException // Exception
ResponseUserDto       // DTO
ExecuteGateway        // WebSocket Gateway
```

### 변수/메서드명 (MUST)

camelCase. 메서드는 동사로 시작한다.

```typescript
// 변수
const userUuid = '...';
const pageNo = 1;
const levelList = [1, 2, 3];

// 메서드
async findUser() { ... }
async createUser() { ... }
async getProblemsSummary() { ... }
private extractTokenFromHeader() { ... }
```

### 상수명 (MUST)

UPPER_SNAKE_CASE. `as const`로 타입 안전성을 확보한다.

```typescript
export const USER_STATE = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export const MAX_PAGE_SIZE = 100;
```

### boolean 변수 (SHOULD)

긍정형으로 명명한다. 이중 부정을 피한다.

```typescript
// 좋은 예
const isActive = true;
const canEdit = user.role === 'ADMIN';

// 나쁜 예
const isNotDisabled = true;
```

---

## 10. import

### 순서 (SHOULD)

3개 그룹, 빈 줄로 구분:

```typescript
// 1. NestJS / 외부 라이브러리
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// 2. 프로젝트 내부 모듈 (상대 경로, 다른 모듈)
import { AuthGuard } from '../auth-guard/auth.guard';
import { TokenUser } from '../common/types/request.type';

// 3. 같은 모듈 내부
import { UsersService } from './users.service';
import { ResponseUserDto } from './dto/response-user.dto';
```

### 상대 경로 (MUST)

상대 경로(`./`, `../`)를 사용한다. 절대 경로나 path alias는 사용하지 않는다.

### barrel 파일 (MUST)

`index.ts` barrel 파일을 만들지 않는다. 직접 파일을 import한다.

### 타입 전용 import (MAY)

타입만 가져올 때는 `import type`을 사용한다. ESLint `consistent-type-imports` 규칙 도입 전까지는 MAY.

```typescript
import type { TokenUser } from '../common/types/request.type';
```

---

## 11. 테스트

### 테스트 필수 (SHOULD, 목표 MUST)

- 신규 Service는 반드시 단위 테스트를 작성한다 (MUST).
- 기존 Service는 수정 시 테스트를 추가한다 (SHOULD).
- 테스트 파일은 소스 파일과 같은 디렉토리에 둔다: `{name}.service.spec.ts`

### 테스트 구조 (SHOULD)

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findUser: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUser', () => {
    it('사용자가 존재하면 반환한다', async () => {
      // Given
      const user = { uuid: 'test-uuid', name: 'test' };
      repository.findUser.mockResolvedValue(user);

      // When
      const result = await service.findUser({ userUuid: 'test-uuid' });

      // Then
      expect(result).toEqual(user);
      expect(repository.findUser).toHaveBeenCalledWith({ userUuid: 'test-uuid' });
    });

    it('사용자가 없으면 UserNotFoundException을 던진다', async () => {
      // Given
      repository.findUser.mockResolvedValue(null);

      // When & Then
      await expect(service.findUser({ userUuid: 'none' }))
        .rejects.toThrow(UserNotFoundException);
    });
  });
});
```

### 테스트 원칙 (SHOULD)

- **Given/When/Then** 주석으로 구조화한다.
- 테스트 설명은 한글로 작성한다.
- Mock은 최소한으로. 테스트 대상 Service의 직접 의존성만 mock한다.
- 각 테스트는 독립적이어야 한다. `afterEach`에서 mock을 초기화한다.
- Application Service + mock Repository 조합이 가장 좋은 테스트 경계이다.

---

## 12. 로깅

### 구조화된 로깅 (SHOULD)

로깅은 새벽 2시에 디버깅할 때를 위한 것이다. 의미 있는 컨텍스트를 포함한다.

- `CustomLogger` (nest-winston)를 사용한다.
- 구조화된 키-값 쌍을 포함한다.

```typescript
this.logger.error('문제 조회 실패', {
  userUuid,
  problemUuid,
  error: error.message,
});
```

### 로깅 레벨 (SHOULD)

| 레벨 | 기준 |
|------|------|
| error | 운영 개입 필요. 예외가 catch되고 복구 불가능할 때 |
| warn | 주의 필요하지만 동작 계속. 재시도 성공, 폴백 사용 등 |
| log (info) | 주요 상태 변경. 서버 시작/중지, 사용자 로그인/로그아웃 |
| debug | 개발/디버깅용. 프로덕션에서는 비활성화 |

### 로깅 금지 사항 (MUST)

- 비밀번호, 토큰, API 키 등 민감 정보를 로깅하지 않는다.
- 에러를 로깅한 후 같은 에러를 다시 던지지 않는다. 둘 중 하나만.

---

## 13. 보안

### SQL Injection 방지 (MUST)

- Prisma 쿼리 빌더를 기본으로 사용한다.
- Raw SQL은 `Prisma.sql` 태그드 템플릿만 사용한다.
- 문자열 보간으로 SQL을 조합하지 않는다.

### 인증/인가 (MUST)

- 인증이 필요한 엔드포인트에 `@UseGuards(AuthGuard)`를 반드시 적용한다.
- 역할 기반 접근 제어는 `@Roles()` + `RolesGuard`를 사용한다.
- 토큰 검증 로직을 Controller나 Service에 직접 작성하지 않는다. Guard에 위임한다.

### 민감 정보 (MUST)

- 에러 응답에 스택 트레이스를 노출하지 않는다 (production).
- 환경 변수는 `ConfigModule`을 통해서만 접근한다. `process.env`를 직접 읽지 않는다. 단, config 파일(`src/config/*.ts`) 및 bootstrap 코드(`main.ts`, `app.module.ts`)에서는 허용.

---

## 14. 주석

### 공개 API (SHOULD)

- Controller 엔드포인트는 Swagger 데코레이터(`@ApiOperation`, `@ApiResponse`)로 문서화한다.
- 별도 JSDoc 주석은 Swagger와 중복되므로 생략한다.

### 코드 주석 (SHOULD)

- "왜(why)"를 설명할 때만 주석. "무엇(what)"은 코드로 드러나야 한다.
- 한글 또는 영문 허용. 일관성보다 명확성 우선.

### TODO (MUST)

```typescript
// TODO(작성자): 설명
// TODO(wonkeun): Redis 클러스터 모드 지원 추가
```

---

## 15. 설정

### 환경 변수 (MUST)

- `src/config/` 디렉토리에 `registerAs()` 패턴으로 정의한다.
- `validationSchema.ts`에 Joi 검증을 추가한다.
- 새 환경 변수를 추가하면 검증 스키마도 함께 추가한다.

```typescript
// src/config/newConfig.ts
import { registerAs } from '@nestjs/config';

export default registerAs('newConfig', () => ({
  apiKey: process.env.NEW_API_KEY,
  timeout: Number(process.env.NEW_TIMEOUT) || 5000,
}));
```

### 매직 넘버/문자열 금지 (SHOULD)

의미 있는 숫자/문자열은 상수로 추출한다.

```typescript
// 나쁜 예
if (retryCount > 3) { ... }
await sleep(5000);

// 좋은 예
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 5000;
```

---

## 16. 비동기와 동시성

### Promise.all 병렬 실행 (SHOULD)

독립적인 비동기 작업은 `Promise.all()`로 병렬 실행한다.

```typescript
// 좋은 예 — 병렬
const [user, problems] = await Promise.all([
  this.usersService.findUser({ userUuid }),
  this.problemsService.findByUser({ userUuid }),
]);

// 나쁜 예 — 불필요한 직렬
const user = await this.usersService.findUser({ userUuid });
const problems = await this.problemsService.findByUser({ userUuid });
```

### 에러 전파 (MUST)

- `Promise.all()`에서 하나라도 실패하면 전체가 실패한다. 이를 의도하지 않는다면 `Promise.allSettled()`를 사용한다.
- 비동기 함수에서 발생한 예외는 반드시 catch하거나 호출자에게 전파한다. fire-and-forget 패턴은 명시적으로 `.catch()`를 붙인다.

---

## 17. WebSocket / Gateway

### Gateway 구조 (SHOULD)

- `@WebSocketGateway()` 데코레이터를 사용한다.
- Gateway는 Controller와 동일한 역할: 메시지 수신/전송만. 비즈니스 로직은 Service에 위임한다.
- 인증은 `WsAuthGuard`를 사용한다.
- 이벤트 핸들러에서 직접 예외를 던지지 않고 `WsException` 또는 전용 WebSocket 예외 필터를 사용한다.

### BullMQ 작업 (SHOULD)

- 큐에 작업을 추가하는 것은 Service의 책임이다.
- 작업 처리 프로세서는 별도 파일로 분리한다.
- 타임아웃과 재시도 정책을 명시적으로 설정한다.

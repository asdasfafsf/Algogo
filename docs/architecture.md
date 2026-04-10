# Architecture

## Overview

NestJS-based algorithmic problem platform (single monolith). Package.json has multi-app scripts (`dev:algogo`, `dev:crawler`, `dev:compiler`) referencing an `apps/` directory that doesn't currently exist -- all code lives in `src/`.

## Infrastructure Stack

- **Database**: MySQL via Prisma ORM (`relationMode = "prisma"` -- no DB-level foreign keys)
- **Cache/Sessions**: Redis (refresh token storage, rate limiting, WebSocket adapter)
- **Job Queue**: BullMQ (Redis-backed) for code compilation jobs
- **File Storage**: AWS S3 (problem images, metadata)
- **WebSocket**: Socket.IO with Redis adapter for real-time code execution results
- **Auth**: Passport.js (Google, Kakao, GitHub OAuth) + custom JWT

## Module Layout (`src/`)

Each module follows **Controller -> Service -> Repository** pattern with DTOs in a `dto/` subfolder.

- **Auth & Users**: `auth-v2/`, `oauth-v2/`, `auth-guard/`, `authorization/`, `users/`, `me/`, `jwt/`
- **Problems**: `problems/` (v1 legacy), `problems-v2/` (current), `problems-collect/`, `problems-report/`, `problem-site/`
- **Code Execution**: `execute/` (WebSocket gateway + BullMQ), `code/` (templates/settings), `rate-limit/`
- **Infrastructure**: `prisma/`, `redis/`, `s3/`, `config/`, `crypto/`, `image/`, `logger/`
- **Cross-cutting**: `common/` (decorators, types, errors), `filters/`, `interceptors/`, `middlewares/`

## Authentication Flow

Guard types:
- **AuthGuard** - Validates JWT from cookie (`access_token`) or `Authorization: Bearer` header. Required auth.
- **DecodeGuard** - Optional auth. Decodes JWT without throwing if missing.
- **WsAuthGuard** - WebSocket-specific. Client sends JWT via `auth` event on connect.
- **RolesGuard** - Checks `@Roles()` decorator metadata against `request.user.roles`

Token lifecycle: OAuth login -> `AuthV2Service.login()` generates access+refresh tokens -> refresh token stored in Redis cache with key `${userUuid}:${refreshToken}` -> `PREV_JWT_SECRET` env var supports secret rotation.

## Code Execution Pipeline

```
Client WebSocket -> ExecuteGateway ('auth' event with JWT)
  -> WsAuthGuard validates
  -> 'execute' event with code + inputs
  -> ExecutionRateLimitGuard (Redis token bucket, per-user)
  -> ExecuteService adds BullMQ job
  -> External compiler processes job
  -> BullMQ progress events -> EventEmitter2
  -> Gateway emits 'executeResult' to socket room
```

Dynamic timeout per job: `(inputCount * 2000) + 3000` ms. Hourly cron cleans connections idle >10 minutes.

## Standard Response Format

All HTTP responses are wrapped by `ResponseInterceptor`:
```json
{ "statusCode": 200, "errorCode": "0000", "errorMessage": "", "data": {} }
```

Errors via `AllExceptionsFilter` return:
```json
{ "statusCode": 400, "errorCode": "AUTH_001", "errorMessage": "..." }
```

Custom exceptions extend `CustomHttpException` with `{ code, message }` shape. Exception classes are in `src/common/errors/`.

## Custom Decorators

- `@User()` - Extracts user from `request.user`
- `@Roles(['ADMIN'])` - Sets role metadata for `RolesGuard`
- `@RequestMetadata()` - Extracts IP and user-agent
- `@MaxBytes()` - File size validation
- Swagger helpers: `@CommonApiResponse`, `@ApiGlobalErrorResponses`

## Config Pattern

Environment configs use `@nestjs/config` `registerAs()` factories with Joi validation schema (`src/config/validationSchema.ts`). Injected via `@Inject(ConfigKey.KEY)`.

Environment files: `.development.env` (local), `.production.env` (prod). `NODE_ENV` defaults to production if unset.

## Key Conventions

- **TypeScript**: `strictNullChecks: false`, `noImplicitAny: false`
- **Imports**: Relative paths from `baseUrl: "./"`, no path aliases
- **Swagger**: Available at `/api` in development mode only
- **CORS**: `http://localhost:5173` allowed in development
- **Validation**: Global `ValidationPipe` with `transform: true`, `whitelist: true`, implicit conversion enabled
- **Logging**: Winston via `nest-winston`
- **Prisma column mapping**: `@@map()` and `@map()` to SCREAMING_SNAKE_CASE DB columns
- **Composite unique keys**: `(source, sourceId)` on problems, `(userUuid, problemUuid, language)` on ProblemCode
- **V1/V2 pattern**: Legacy modules (`problems/`, `auth/`) coexist with v2 replacements. New work should use v2 modules.
- **Prisma schema**: Actual path is `prisma/schema.prisma`. Package.json scripts reference `libs/shared-prisma/prisma/schema.prisma` (outdated).

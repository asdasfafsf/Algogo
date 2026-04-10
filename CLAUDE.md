# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- This project does NOT use MoAI. Do not apply MoAI orchestration, templates, or workflows.
- 문서는 코드를 읽는 것보다 문서를 읽는 게 나을 때만 작성한다. 코드로 알 수 있는 내용은 문서화하지 않는다.

`.claude/rules/` 에 자동 로드됨:
- `code.md` — TypeScript/NestJS 코딩 규칙 (Effective TS 기반, strict 타입 최우선)
- `git.md` — Git 브랜치, 커밋, PR, 머지 규칙 (ALGOGO-번호 기반)
- `linear.md` — Linear 이슈 관리 규칙 + Algogo 팀/프로젝트 설정값
- `workflow.md` — .claude/ 파일 편집 시 드래프트 패턴

`.claude/commands/` 에 정의됨:
- `/work {ALGOGO-번호 또는 설명}` — 이슈 → 브랜치 → 코드 → 커밋 → PR → 머지 → Linear Done 전체 워크플로우

## Commands

- `pnpm dev` - Dev server (watch mode)
- `pnpm build` - Build
- `pnpm start:prod` - Production server
- `pnpm test` - Unit tests
- `pnpm test -- --testPathPattern="<pattern>"` - Single test
- `pnpm test:e2e` - E2E tests
- `pnpm lint` - ESLint
- `pnpm format` - Prettier
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run migrations
- `pnpm prisma:studio` - Prisma Studio GUI

## Architecture

NestJS monolith, MySQL/Prisma, Redis, BullMQ, S3, Socket.IO, JWT+OAuth.

## Workflow

Linear 이슈 기반. 이슈 → 브랜치 → 코드 → 커밋 → PR → 머지 → Done.
Details: [docs/workflow.md](docs/workflow.md)

## ADR

의사결정 기록. feat/refactor 커밋 시 adr-check 훅이 자동 알림.
Details: [docs/adr/README.md](docs/adr/README.md)


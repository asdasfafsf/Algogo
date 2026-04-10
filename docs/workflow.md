# Algogo Workflow

Global rules (test separation, review criteria, phases) are in ~/CLAUDE.md.
This file contains Algogo-specific execution plan only.

## Team

| Agent | Role |
|-------|------|
| ryan-dahl | Node.js/TypeScript backend lead |
| expert-backend | API/DB/auth architecture |
| expert-refactoring | V1->V2 consolidation, code cleanup |
| kent-beck | Test agent (writes all tests, separate from implementers) |
| expert-security | Security audit, vulnerability fixes |
| expert-performance | WebSocket/BullMQ/DB optimization |
| expert-devops | CI/CD, Docker, deployment |
| manager-docs | API docs, dev guides |
| expert-debug | Bug diagnosis, troubleshooting |

## Automated Gates (Algogo-specific)

- ESLint: `@typescript-eslint/no-explicit-any: error`
- Jest coverage threshold: 85%
- CI check: every `*.service.ts` has matching `*.spec.ts`
- Setup responsibility: expert-devops (Phase 2)

## Phase 1: Audit

Read-only. 4 agents parallel.

| Agent | Task | Output |
|-------|------|--------|
| expert-security | OAuth/JWT flow, input validation, CSRF | Vulnerability report |
| kent-beck | Untested critical paths, test gap analysis | Test gap report |
| expert-performance | WebSocket latency, BullMQ throughput, slow queries | Performance baseline |
| expert-refactoring | V1/V2 overlap, any-type inventory, error handling gaps | Refactoring priority list |

## Phase 2: Foundation

3 tracks parallel. Complete when CI pipeline runs green.

| Agent | Task |
|-------|------|
| expert-devops | Dockerfile, docker-compose, GitHub Actions CI, ESLint rule additions |
| kent-beck | Jest config, shared mocks/utils, first tests for auth + execute |
| expert-security | Fix critical vulnerabilities from Phase 1 |

## Phase 3: Core

4 tracks parallel. Non-overlapping module assignment to avoid file conflicts.

| Agent | Task |
|-------|------|
| expert-refactoring + ryan-dahl | V1 removal, TypeScript strict mode, error handling standardization |
| kent-beck | Test coverage for all services + repositories, E2E suite |
| expert-performance | WebSocket/BullMQ optimization, DB query tuning |
| expert-backend | API consistency, Repository pattern enforcement |

Flow per change:
1. Implementation agent writes code
2. kent-beck writes tests against public interface
3. Tests fail → back to implementation agent
4. Tests pass + CI green → done

## Phase 4: Stabilize

3 tracks parallel.

| Agent | Task |
|-------|------|
| manager-docs | API docs, dev setup guide, architecture docs, DB schema docs |
| expert-security | Final security review of Phase 3 changes |
| expert-debug | Integration testing, bug triage |

## Phase 5: Ongoing

| Agent | Role |
|-------|------|
| ryan-dahl | New features |
| expert-backend | Architecture evolution |
| kent-beck | Test writing for all new code |
| expert-debug | Bug fixes |

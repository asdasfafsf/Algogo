# Algogo Workflow

## 개발 프로세스

모든 작업은 Linear 이슈 기반으로 진행한다.

```
Linear 이슈 생성 → 브랜치 생성 → 코드 작업 → 커밋 → PR → 셀프 리뷰 → 머지 → Linear Done
```

## 브랜치 전략

- `main`: 릴리스 가능한 안정 버전
- `dev/algogo`: 개발 통합 브랜치
- `ALGOGO-{번호}`: 기능 브랜치 (dev에서 분기, dev로 squash merge)

상세 규칙: `.claude/rules/git.md`

## 이슈 관리

- 모든 작업은 Linear 이슈로 시작한다
- 이슈 없이 코드를 수정하지 않는다
- 상태 전환: Backlog → Todo → In Progress → In Review → Done

상세 규칙: `.claude/rules/linear.md`

## 코드 리뷰

- 셀프 리뷰 후 머지 허용
- TypeScript 컴파일 에러 없을 것
- 기존 테스트 통과할 것

## 의사결정 기록

코드만으로 드러나지 않는 "왜"가 있으면 `docs/adr/`에 ADR을 작성한다.

상세 규칙: `docs/adr/README.md`

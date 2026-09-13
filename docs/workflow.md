# Algogo Workflow

## 개발 프로세스

문서·설정을 포함한 모든 변경 작업은 아래 Linear 이슈 기반 절차를 따른다.

```
Linear 이슈 생성 → 브랜치 생성 → 코드 작업 → 커밋 → PR → 셀프 리뷰 → 머지 → Linear Done
```

## 브랜치 전략

- `main`: 릴리스 가능한 안정 버전
- `dev`: 개발 통합 브랜치
- `ALGOGO-{번호}`: 기능 브랜치 (dev에서 분기, dev로 squash merge)

상세 규칙: `docs/agents/git.md`

## 이슈 관리

- 이슈 작업은 기존 Linear 이슈를 연결한다
- 로컬 변경도 이슈 확인 후 이슈 브랜치의 별도 워크트리에서 수행한다
- 상태 전환: Backlog → Todo → In Progress → In Review → Done

상세 규칙: `docs/agents/linear.md`

## 코드 리뷰

- 셀프 리뷰 후 머지 허용
- TypeScript 컴파일 에러 없을 것
- 기존 테스트 통과할 것

## 의사결정 기록

코드만으로 드러나지 않는 "왜"가 있으면 `docs/adr/`에 ADR을 작성한다.

상세 규칙: `docs/adr/README.md`

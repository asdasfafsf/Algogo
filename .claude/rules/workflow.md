---
paths:
  - ".claude/**"
---

# Claude 작업 규칙

`.claude/` 하위 파일을 수정할 때 따르는 규칙.

## 드래프트 패턴

`.claude/` 디렉토리는 보호 경로라서 Edit/Write 시 매번 allow 프롬프트가 뜬다. 이를 피하기 위해 임시 파일에서 작업한다.

1. 원본을 프로젝트 루트에 복사한다: `cp .claude/rules/code.md code-draft.md`
2. 드래프트 파일에서 수정한다
3. 완료 후 원본에 복사한다: `cp code-draft.md .claude/rules/code.md`
4. 드래프트 파일을 삭제한다: `rm code-draft.md`

- 드래프트 파일명: `{원본명}-draft.{확장자}` (예: `code-draft.md`, `hook-draft.sh`)
- 새 파일 생성 시에도 동일하게 루트에서 작성 후 복사한다

## 코드 리뷰

`.claude/rules/` 규칙 파일을 수정하거나 새로 작성할 때는 별도 에이전트에게 리뷰를 요청한다.

- 리뷰 에이전트에게 전체 파일을 읽게 한다
- "리뷰 결과: 양호"가 나올 때까지 수정 → 리뷰를 반복한다
- 리뷰 시 드래프트 파일 경로를 전달한다 (원본 경로가 아닌)

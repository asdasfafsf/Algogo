Linear 이슈 기반 작업을 시작한다. 이슈 → worktree → 코드 → 커밋 → PR → 머지 → Linear 상태 업데이트까지 전체 워크플로우를 수행한다.

## 인자

$ARGUMENTS — Linear 이슈 번호 (예: ALGOGO-1) 또는 작업 설명

## 워크플로우

### 1. 이슈 확인/생성
- 이슈 번호가 주어지면: LINEAR_API_KEY로 GraphQL API 호출하여 이슈 내용 확인
- 작업 설명이 주어지면: 이슈 초안을 사용자에게 보여주고 확인받은 후 생성
- Linear 이슈 상태를 **In Progress**로 변경

### 2. worktree 에이전트 실행
- Agent 도구를 `isolation: "worktree"`로 실행한다
- 에이전트에게 전달할 내용: 이슈 번호, 이슈 제목, 이슈 설명, 작업 지시
- 에이전트가 worktree 안에서 다음을 수행한다:
  1. `dev`에서 `ALGOGO-{번호}` 브랜치 생성
  2. 이슈 내용에 따라 코드 작성
  3. `rtk pnpm build` 빌드 확인
  4. `rtk pnpm test` 테스트 통과 확인
  5. 관련 파일만 `git add` (git add -A 사용 금지)
  6. 커밋: `[ALGOGO-{번호}] {type}: {설명}`
  7. `git push -u origin ALGOGO-{번호}`
  8. `gh pr create --base dev` (PR 본문은 git.md 템플릿 사용)
  9. `gh pr merge --squash --delete-branch`

### 3. 결과 확인 및 Linear 업데이트
- 에이전트 결과를 받아 사용자에게 보고
- Linear 이슈 상태를 **Done**으로 변경
- 이슈 설명에 결과 섹션 추가 (PR 링크)

## 주의
- 메인 워킹 디렉토리는 항상 `dev`에 머물러야 한다. 직접 `git checkout -b`하지 않는다
- 모든 커맨드에 `rtk` 프리픽스 사용
- 빌드/테스트 실패 시 에이전트 안에서 수정 후 재시도
- 대안을 검토하고 선택한 의사결정이 있으면 ADR 작성 여부를 사용자에게 확인

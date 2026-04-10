Linear 이슈 기반 작업을 시작한다. 이슈 → 브랜치 → 코드 → 커밋 → PR → 머지 → Linear 상태 업데이트까지 전체 워크플로우를 수행한다.

## 인자

$ARGUMENTS — Linear 이슈 번호 (예: ALGOGO-1) 또는 작업 설명

## 워크플로우

### 1. 이슈 확인/생성
- 이슈 번호가 주어지면: LINEAR_API_KEY로 GraphQL API 호출하여 이슈 내용 확인
- 작업 설명이 주어지면: 이슈 초안을 사용자에게 보여주고 확인받은 후 생성
- Linear 이슈 상태를 **In Progress**로 변경

### 2. 브랜치 생성
- `dev`에서 분기: `git checkout -b ALGOGO-{번호} dev`
- 브랜치명은 티켓명 그대로 사용한다

### 3. 코드 작성
- 이슈 내용에 따라 코드 작성
- `pnpm build` 빌드 확인
- `pnpm test` 테스트 통과 확인
- `pnpm lint` 린트 통과 확인

### 4. 커밋
- 브랜치명에서 이슈 번호 추출
- 커밋 메시지: `[ALGOGO-{번호}] {type}: {설명}`
- 관련 파일만 `git add` (git add -A 사용 금지)

### 5. PR 생성 + 머지
- `git push -u origin {브랜치}`
- `gh pr create --base dev` (PR 본문은 git.md 템플릿 사용)
- `gh pr merge --squash --delete-branch`

### 6. Linear 상태 업데이트
- 이슈 상태를 **Done**으로 변경
- 이슈 설명에 결과 섹션 추가 (PR 링크)

## 주의
- 모든 커맨드에 `rtk` 프리픽스 사용
- 빌드/테스트 실패 시 수정 후 재시도
- PR 머지 전 충돌 확인 (dev merge 후 push)
